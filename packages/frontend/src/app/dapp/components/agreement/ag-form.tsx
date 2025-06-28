// 'use client';

// import {
//   ChangeEvent,
//   FormEvent,
//   useState,
// } from 'react';
// import { Button, TextField } from '@radix-ui/themes';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { motion, AnimatePresence } from 'framer-motion';
// import useNetworkConfig from '~~/hooks/useNetworkConfig';
// import CustomConnectButton from '~~/components/CustomConnectButton';
// import { notification } from '~~/helpers/notification';
// import { transactionUrl } from '~~/helpers/network';
// import useTransact from '@suiware/kit/useTransact';
// import { encryptString } from '../../../../lib/encrypt';
// import { CONTRACT_PACKAGE_VARIABLE_NAME, EXPLORER_URL_VARIABLE_NAME } from '~~/config/network';
// import { prepareCreateAgreementTx } from '~~/dapp/helpers/transactions';

// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementForm() {
//   const current = useCurrentAccount();
//   const { useNetworkVariable } = useNetworkConfig();
//   const pkg = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
//   const explorer = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME);

//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const [metadataFields, setMetadataFields] = useState([{ key: '', value: '' }]);
//   const [signatories, setSignatories] = useState('');
//   const [expiry, setExpiry] = useState('');

//   const { transact } = useTransact({
//     onBeforeStart: () => notification.txLoading(),
//     onSuccess: (tx) =>
//       notification.txSuccess(transactionUrl(explorer, tx.digest)),
//     onError: (err) => notification.txError(err),
//   });

//   const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setFile(file);
//     const url = URL.createObjectURL(file);
//     setPreview(url);
//   };

//   const handleAddMetadataField = () => {
//     setMetadataFields([...metadataFields, { key: '', value: '' }]);
//   };

//   const handleMetadataChange = (i: number, field: 'key' | 'value', val: string) => {
//     const copy = [...metadataFields];
//     copy[i][field] = val;
//     setMetadataFields(copy);
//   };

//   const uploadMedia = async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append('file', file);
//     const res = await fetch('/api/file/upload-agreement', {
//       method: 'POST',
//       body: formData,
//     });
//     if (!res.ok) throw new Error('Media upload failed');
//     const { url } = await res.json();
//     return url;
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!file || !signatories || !expiry)
//       return notification.error(null, 'Please complete all fields.');

//     try {
//       setUploading(true);
//       const mediaUrl = await uploadMedia(file);
//       const encryptedMedia = await encryptString(mediaUrl, SECRET);

//       const metadataObj = metadataFields.reduce((acc, { key, value }) => {
//         if (key && value) acc[key] = value;
//         return acc;
//       }, {} as Record<string, string>);
//       const metadataJson = JSON.stringify(metadataObj);
//       const encryptedMetadata = await encryptString(metadataJson, SECRET);

//       const signerList = signatories
//         .split(',')
//         .map((s) => s.trim())
//         .filter(Boolean);
//       const encryptedSigners = await Promise.all(
//         signerList.map((s) => encryptString(s, SECRET))
//       );

//       const tx = prepareCreateAgreementTx(
//         pkg,
//         encryptedMedia,
//         encryptedMetadata,
//         encryptedSigners,
//         expiry
//       );

//       await transact(tx);

//       await fetch('/api/ag', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           encryptedMedia,
//           encryptedMetadata,
//           encryptedSigners,
//           expiry,
//           sender: current?.address,
//         }),
//       });

//       notification.success('Agreement created!');
//     } catch (err) {
//       console.error(err);
//       notification.error(err as Error, 'Creation failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (!current) return <CustomConnectButton />;

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto px-6 py-8 bg-white dark:bg-gray-950 shadow-xl rounded-xl">
//       <h2 className="text-2xl font-bold">Create Agreement</h2>

//       {/* Media Upload */}
//       <div>
//         <label className="block text-sm mb-1 font-medium">Upload Media</label>
//         <input
//           type="file"
//           accept="image/*,video/*,audio/*"
//           onChange={handleFileChange}
//           className="block w-full"
//         />
//         {preview && (
//           <div className="mt-2 rounded overflow-hidden max-h-[240px] border">
//             {file?.type.startsWith('image') ? (
//               <img src={preview} alt="Preview" className="w-full h-auto object-contain" />
//             ) : file?.type.startsWith('video') ? (
//               <video controls src={preview} className="w-full h-auto" />
//             ) : file?.type.startsWith('audio') ? (
//               <audio controls src={preview} className="w-full" />
//             ) : null}
//           </div>
//         )}
//       </div>

//       {/* Signatories */}
//       <TextField.Root
//         size="3"
//         placeholder="Comma-separated Sui addresses"
//         value={signatories}
//         onChange={(e) => setSignatories(e.target.value)}
//       />

//       {/* Expiry */}
//       <TextField.Root
//         size="3"
//         placeholder="Expiry Date (e.g., 2025-12-31)"
//         value={expiry}
//         onChange={(e) => setExpiry(e.target.value)}
//       />

//       {/* Metadata Builder */}
//       <div className="space-y-2">
//         <label className="block text-sm font-medium mb-1">Metadata</label>
//         {metadataFields.map((field, i) => (
//           <div key={i} className="flex gap-2">
//             <TextField.Root
//               placeholder="Key"
//               value={field.key}
//               onChange={(e) => handleMetadataChange(i, 'key', e.target.value)}
//             />
//             <TextField.Root
//               placeholder="Value"
//               value={field.value}
//               onChange={(e) => handleMetadataChange(i, 'value', e.target.value)}
//             />
//           </div>
//         ))}
//         <button
//           type="button"
//           className="text-blue-600 text-sm mt-1"
//           onClick={handleAddMetadataField}
//         >
//           + Add Field
//         </button>
//       </div>

//       <Button type="submit" disabled={uploading}>
//         {uploading ? 'Submitting...' : 'Create Agreement'}
//       </Button>
//     </form>
//   );
// }





'use client';

import {
  ChangeEvent,
  FormEvent,
  useState,
} from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { notification } from '~~/helpers/notification';
import { transactionUrl } from '~~/helpers/network';
import useTransact from '@suiware/kit/useTransact';
import { encryptString } from '../../../../lib/encrypt';
import { CONTRACT_PACKAGE_VARIABLE_NAME, EXPLORER_URL_VARIABLE_NAME } from '~~/config/network';
import { prepareCreateAgreementTx } from '~~/dapp/helpers/transactions';
import CustomConnectButton from '~~/components/CustomConnectButton';
import useNetworkConfig from '~~/hooks/useNetworkConfig';

const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

export default function AgreementForm() {
  const current = useCurrentAccount();
  const { useNetworkVariable } = useNetworkConfig();
  const pkg = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
  const explorer = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME);

  const [notificationId, setNotificationId] = useState<string>()

//   const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [metadataFields, setMetadataFields] = useState([{ key: '', value: '' }]);
  // Instead of one string, keep two separate signatories
  const [signatory1, setSignatory1] = useState('');
  const [signatory2, setSignatory2] = useState('');
  const [expiry, setExpiry] = useState('');

  const { transact } = useTransact({
    onBeforeStart: () => notification.txLoading(),
    onSuccess: (tx) =>
      notification.txSuccess(transactionUrl(explorer, tx.digest)),
    onError: (err) => notification.txError(err),
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const currentAddress = current?.address

  const handleAddMetadataField = () => {
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  const handleMetadataChange = (i: number, field: 'key' | 'value', val: string) => {
    const copy = [...metadataFields];
    copy[i][field] = val;
    setMetadataFields(copy);
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/file/upload-agreement', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Media upload failed');
    const { url } = await res.json();
    return url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !current?.address || !signatory2 || !expiry)
      return notification.error(null, 'Please complete all fields.');

    try {
      setUploading(true);
      const mediaUrl = await uploadMedia(file);
      const encryptedMedia = await encryptString(mediaUrl, SECRET);

      const metadataObj = metadataFields.reduce((acc, { key, value }) => {
        if (key && value) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      const metadataJson = JSON.stringify(metadataObj);
      const encryptedMetadata = await encryptString(metadataJson, SECRET);

      // Encrypt each signatory separately
      const encryptedSignatory1 = await encryptString(signatory1.trim(), SECRET);
      const encryptedSignatory2 = await encryptString(signatory2.trim(), SECRET);

      // Prepare transaction with exactly two signatories as separate args
      const tx = prepareCreateAgreementTx(
        pkg,
        encryptedMedia,
        encryptedMetadata,
        current.address,
        signatory2,
        expiry
      );

      await transact(tx);

      const res = await fetch('/api/ag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedMedia,
          encryptedMetadata,
          currentAddress,
          signatory2,
          expiry,
          sender: current?.address,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Transaction failed');

      console.log("the digest is", result.digest);

      notification.txSuccess(transactionUrl(explorerUrl, result.digest), notificationId);

      notification.success('Agreement created!');
    } catch (err) {
      console.error(err);
      notification.error(err as Error, 'Creation failed');
    } finally {
      setUploading(false);
    }
  };

  if (!current) return <CustomConnectButton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto px-6 py-8 bg-white dark:bg-gray-950 shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold">Create Agreement</h2>

      {/* Media Upload */}
      <div>
        <label className="block text-sm mb-1 font-medium">Upload Media</label>
        <input
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={handleFileChange}
          className="block w-full"
        />
        {preview && (
          <div className="mt-2 rounded overflow-hidden max-h-[240px] border">
            {file?.type.startsWith('image') ? (
              <img src={preview} alt="Preview" className="w-full h-auto object-contain" />
            ) : file?.type.startsWith('video') ? (
              <video controls src={preview} className="w-full h-auto" />
            ) : file?.type.startsWith('audio') ? (
              <audio controls src={preview} className="w-full" />
            ) : null}
          </div>
        )}
      </div>

      {/* Signatories */}
      <TextField.Root
        size="3"
        placeholder="Signatory 1 Sui address"
        value={current.address}
        // defaultValue
        // onChange={(e) => setSignatory1(e.target.value)}
        // onChange={(e) => setSignatory1(current?.address)}
      />
      <TextField.Root
        size="3"
        placeholder="Signatory 2 Sui address"
        value={signatory2}
        onChange={(e) => setSignatory2(e.target.value)}
      />

      {/* Expiry */}
      <TextField.Root
        size="3"
        placeholder="Expiry Date (e.g., 2025-12-31)"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
      />

      {/* Metadata Builder */}
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Metadata</label>
        {metadataFields.map((field, i) => (
          <div key={i} className="flex gap-2">
            <TextField.Root
              placeholder="Key"
              value={field.key}
              onChange={(e) => handleMetadataChange(i, 'key', e.target.value)}
            />
            <TextField.Root
              placeholder="Value"
              value={field.value}
              onChange={(e) => handleMetadataChange(i, 'value', e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 text-sm mt-1"
          onClick={handleAddMetadataField}
        >
          + Add Field
        </button>
      </div>

      <Button type="submit" disabled={uploading}>
        {uploading ? 'Submitting...' : 'Create Agreement'}
      </Button>
    </form>
  );
}
