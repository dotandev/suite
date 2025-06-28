'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomConnectButton from '~~/components/CustomConnectButton';
import Loading from '~~/components/Loading';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Button, TextField } from '@radix-ui/themes';
import useTransact from '@suiware/kit/useTransact';
import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard';
import { notification } from '~~/helpers/notification';
import { transactionUrl } from '~~/helpers/network';
import useNetworkConfig from '~~/hooks/useNetworkConfig';
import { prepareSellPatentTransaction } from '~~/dapp/helpers/transactions';
import { CONTRACT_PACKAGE_VARIABLE_NAME, EXPLORER_URL_VARIABLE_NAME } from '~~/config/network';


const packageId = process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID!;
const decryptionSecret = 'secret';

const client = new SuiClient({ url: getFullnodeUrl('devnet') });

async function decryptText(encryptedBase64: string, secret: string): Promise<string> {
  try {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    if (encryptedBytes.length < 29) throw new Error('Encrypted data too short');

    const salt = encryptedBytes.slice(0, 16);
    const iv = encryptedBytes.slice(16, 28);
    const data = encryptedBytes.slice(28);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return decoder.decode(decrypted);
  } catch {
    return '🔒 Unable to decrypt - check your code!';
  }
}

type PatentEvent = {
  objectId: string;
  creator: string;
  data: string;         // encrypted image URL
  hashedCode: string;   // encrypted code
  name: string;
  description: string;
  createdAt: string;    // encrypted timestamp string
};

function PatentCard({ patent }: { patent: PatentEvent }) {
  const [userCode, setUserCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [decryptedCode, setDecryptedCode] = useState<string | null>(null);
  const [decryptedUrl, setDecryptedUrl] = useState<string>();
  const [decryptedName, setDecryptedName] = useState<string | null>(null);
  const [decryptedDescription, setDecryptedDescription] = useState<string | null>(null);
  const [decryptedCreatedAt, setDecryptedCreatedAt] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Decrypt all fields once on mount
  useEffect(() => {
    let mounted = true;
    setDecrypting(true);

    decryptText(patent.hashedCode, decryptionSecret).then((code) => {
      if (!mounted) return;
      setDecryptedCode(code);
      setDecrypting(false);
    });
    decryptText(patent.data, decryptionSecret).then((url) => {
      if (!mounted) return;
      setDecryptedUrl(url);
    });
    decryptText(patent.name, decryptionSecret).then((name) => {
      if (!mounted) return;
      setDecryptedName(name);
    });
    decryptText(patent.description, decryptionSecret).then((desc) => {
      if (!mounted) return;
      setDecryptedDescription(desc);
    });
    decryptText(patent.createdAt, decryptionSecret).then((date) => {
      if (!mounted) return;
      setDecryptedCreatedAt(date);
    });

    return () => {
      mounted = false;
    };
  }, [patent]);

  function tryUnlock() {
    setError(null);
    if (!decryptedCode || decryptedCode.startsWith('🔒')) {
      setError('Cannot verify code - decryption failed.');
      return;
    }
    if (userCode.trim() === decryptedCode.trim()) {
      setUnlocked(true);
      setIsOpen(true);
    } else {
      setError('Incorrect code. Try again.');
    }
  }

  return (
    <motion.div
      layout
      initial={{ borderRadius: 16 }}
      className="mb-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden"
    >
      <button
        onClick={() => unlocked && setIsOpen(!isOpen)}
        className={`flex items-center w-full p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 select-none ${unlocked ? 'cursor-pointer' : 'cursor-default'
          }`}
        aria-expanded={isOpen}
        aria-controls={`patent-details-${patent.objectId}`}
        disabled={!unlocked}
        type="button"
      >
        <img
          src={decryptedUrl}
          alt={`Patent ${patent.objectId}`}
          loading="lazy"
          className={`w-28 h-28 rounded-lg object-cover flex-shrink-0 border border-gray-300 dark:border-gray-600 ${!unlocked ? 'filter blur-sm grayscale' : ''
            }`}
        />
        <div className="ml-6 flex-grow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {decryptedName ? decryptedName : `Patent ID: ${patent.objectId}`}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 select-none">{`Creator: ${patent.creator}`}</p>
          {!unlocked ? (
            <>
              <label
                htmlFor={`code-input-${patent.objectId}`}
                className="block mt-4 mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enter Unlock Code
              </label>
              <input
                id={`code-input-${patent.objectId}`}
                type="password"
                className="w-40 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
                disabled={decrypting}
                autoComplete="off"
                spellCheck={false}
              />
              <Button
                variant="solid"
                className="mt-2"
                onClick={tryUnlock}
                disabled={decrypting || userCode.trim().length === 0}
              >
                Unlock
              </Button>
              {error && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</p>}
              {decrypting && <p className="mt-2 text-indigo-600 dark:text-indigo-400 text-sm">Decrypting secret code...</p>}
            </>
          ) : (
            <p className="mt-2 font-mono text-indigo-600 dark:text-indigo-400 text-sm select-text">
              Code verified! Click to toggle details.
            </p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`ml-4 text-gray-400 dark:text-gray-500 ${unlocked ? '' : 'opacity-0'}`}
          aria-hidden="true"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`patent-details-${patent.objectId}`}
            initial={{ opacity: 0, height: 0, paddingTop: 0 }}
            animate={{ opacity: 1, height: 'auto', padding: '16px' }}
            exit={{ opacity: 0, height: 0, paddingTop: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-b-xl border-t border-gray-200 dark:border-gray-700 select-text"
          >
            <p className="text-gray-800 dark:text-gray-300 mb-2 font-semibold">Patent Code (Decrypted):</p>
            <pre className="whitespace-pre-wrap break-words bg-gray-100 dark:bg-gray-900 rounded p-4 text-sm text-indigo-700 dark:text-indigo-300 font-mono">
              {decryptedCode}
            </pre>

            <p className="text-gray-800 dark:text-gray-300 mb-2 font-semibold mt-4">Patent Image:</p>
            <img
              src={decryptedUrl}
              alt={`Patent ${patent.objectId}`}
              loading="lazy"
              className="rounded-lg object-cover flex-shrink-0 border border-gray-300 dark:border-gray-600 max-h-64 mx-auto"
            />

            <div className="mt-4 text-gray-900 dark:text-gray-100 space-y-1">
              <p><strong>Name:</strong> {decryptedName ?? 'Loading...'}</p>
              <p><strong>Description:</strong> {decryptedDescription ?? 'Loading...'}</p>
              <p><strong>Created At:</strong> {decryptedCreatedAt ?? 'Loading...'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


type SellPatentProps = {
  patentObjectId: string;
  onSuccess?: () => void;
};

export function SellPatent({ patentObjectId, onSuccess }: SellPatentProps) {
  const [recipient, setRecipient] = useState('');
  const [notificationId, setNotificationId] = useState<string>()
  const [loading, setLoading] = useState(false);
  const { useNetworkVariable } = useNetworkConfig();
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)

  const { transact: sellPatent } = useTransact({
    onBeforeStart: () => {
      setLoading(true);
      notification.txLoading();
    },
    onSuccess: (tx: SuiSignAndExecuteTransactionOutput) => {
      setLoading(false);
      notification.txSuccess(transactionUrl(explorerUrl, tx.digest), notificationId),
        onSuccess?.();
    },
    onError: (e: Error) => {
      setLoading(false);
      notification.txError(e);
    },
  });

  async function handleSell() {
    if (!recipient) {
      notification.error(null, 'Please enter recipient address');
      return;
    }
    try {
      const tx = prepareSellPatentTransaction(packageId, patentObjectId, recipient);
      await sellPatent(tx);
    } catch (e) {
      notification.error(e as Error, 'Failed to sell patent');
    }
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 max-w-md mx-auto mt-4">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Sell Patent</h3>
      <TextField.Root size="3" placeholder="Recipient Sui Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      <Button variant="solid" className="mt-4 w-full" onClick={handleSell} disabled={loading}>
        {loading ? 'Processing...' : 'Sell Patent'}
      </Button>
    </div>
  );
}


function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const delta = 2;
    let range: (number | string)[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 2) {
      range = [1, '...', ...range];
    } else if (left === 2) {
      range = [1, ...range];
    }

    if (right < totalPages - 1) {
      range = [...range, '...', totalPages];
    } else if (right === totalPages - 1) {
      range = [...range, totalPages];
    }

    return range;
  }, [currentPage, totalPages]);

  return (
    <nav
      className="flex justify-center items-center space-x-1 mt-8 select-none"
      aria-label="Pagination Navigation"
    >
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
        className="px-3"
      >
        &laquo;
      </Button>

      {pages.map((page, i) =>
        typeof page === 'number' ? (
          <motion.button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-1 rounded-md font-semibold transition-colors ${page === currentPage
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'
              }`}
            aria-current={page === currentPage ? 'page' : undefined}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            {page}
          </motion.button>
        ) : (
          <span key={`dots-${i}`} className="px-3 text-gray-400 select-none">
            &#8230;
          </span>
        )
      )}

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
        className="px-3"
      >
        &raquo;
      </Button>
    </nav>
  );
}

export default function PatentList() {
  const currentAccount = useCurrentAccount();
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patents', currentAccount?.address],
    // queryFn: async () => {
    //   if (!currentAccount?.address) return [];

    //   const res = await client.queryEvents({
    //     query: {
    //       MoveEventType: `${packageId}::patent::PatentCreated`,
    //     },
    //   });

    //   console.log("response ffrom rpc events", res.data)

    //   // return res.data.map((event) => {
    //   //   const parsed = event.parsedJson as {
    //   //     creator: string;
    //   //     data: string;
    //   //     hashed_code: string;
    //   //     patent_id: string;
    //   //     name: string;
    //   //     description: string;
    //   //     created_at: string;
    //   //   };

    //   //   return {
    //   //     objectId: parsed.patent_id,
    //   //     creator: parsed.creator,
    //   //     data: parsed.data,
    //   //     hashedCode: parsed.hashed_code,
    //   //     name: parsed.name,
    //   //     description: parsed.description,
    //   //     createdAt: parsed.created_at,
    //   //   };
    //   // });

    //   return res.data
    //     .map((event) => {
    //       const parsed = event.parsedJson as {
    //         creator: string;
    //         data: string;
    //         hashed_code: string;
    //         patent_id: string;
    //         name: string;
    //         description: string;
    //         created_at: string;
    //       };

    //       return {
    //         objectId: parsed.patent_id,
    //         creator: parsed.creator,
    //         data: parsed.data,
    //         hashedCode: parsed.hashed_code,
    //         name: parsed.name,
    //         description: parsed.description,
    //         createdAt: parsed.created_at,
    //       };
    //     })
    //     .filter((event) => event.creator === currentAccount.address);
    // },

    queryFn: async () => {
      if (!currentAccount?.address) return [];

      const objects = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${packageId}::patent::Patent`,
        },
        options: {
          showContent: true,
        },
      });

      return objects.data.map((obj) => {
        const content = obj.data?.content;
        if (!content || content.dataType !== 'moveObject' || content.type !== `${packageId}::patent::Patent`) {
          return null;
        }

        const fields = content.fields as {
          creator: string;
          data: string;
          hashed_code: string;
          name: string;
          description: string;
          created_at: string;
        };

        return {
          objectId: obj.data?.objectId as string,
          creator: fields.creator,
          data: fields.data,
          hashedCode: fields.hashed_code,
          name: fields.name,
          description: fields.description,
          createdAt: fields.created_at,
        };
      }).filter(Boolean); // remove nulls
    },
    enabled: !!currentAccount?.address,
  });

  const totalPages = useMemo(() => (data ? Math.ceil(data.length / itemsPerPage) : 1), [data]);

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, page]);

  if (!currentAccount) return <CustomConnectButton />;
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="text-red-500 text-center mt-6">
        Error loading patents. Please refresh or try again later.
      </div>
    );
  if (!data || data.length === 0)
    return (
      <div className="text-center mt-6 text-gray-500 dark:text-gray-400">
        No patents found for your wallet
      </div>
    );

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="mb-8 text-4xl font-extrabold text-center dark:text-gray-100 tracking-tight">
        Your Patents
      </h1>

      <div className="flex justify-center space-x-4 mb-6">
        <Button
          variant={viewMode === 'grid' ? 'solid' : 'outline'}
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
        >
          Grid View
        </Button>
        <Button
          variant={viewMode === 'list' ? 'solid' : 'outline'}
          onClick={() => setViewMode('list')}
          aria-label="List view"
        >
          List View
        </Button>
      </div>

      <section
        aria-label={`${viewMode === 'grid' ? 'Grid' : 'List'} view of patents`}
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col space-y-4'
        }
      >
        {paginatedData.map((patent) => (
          <div key={patent?.objectId} className={viewMode === 'grid' ? '' : 'w-full'}>
            <PatentCard patent={patent!} />
            <SellPatent patentObjectId={patent?.objectId as string} onSuccess={() => alert('Patent sold successfully')} />
          </div>
        ))}
      </section>

      <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />

      <div className="mt-8 text-center">
        <Button variant="solid" onClick={() => refetch()}>
          Refresh Patents
        </Button>
      </div>
    </main>
  );
}
