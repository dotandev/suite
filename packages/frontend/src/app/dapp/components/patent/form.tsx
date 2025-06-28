'use client'

import { useState, ChangeEvent, MouseEvent } from 'react'
import { Button, TextField } from '@radix-ui/themes'
import { useCurrentAccount } from '@mysten/dapp-kit'
import useTransact from '@suiware/kit/useTransact'
import CustomConnectButton from '~~/components/CustomConnectButton'
import { transactionUrl } from '~~/helpers/network'
import { notification } from '~~/helpers/notification'
import { prepareCreatePatentTransaction } from '~~/dapp/helpers/transactions'
import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard'
import { CONTRACT_PACKAGE_VARIABLE_NAME, EXPLORER_URL_VARIABLE_NAME } from '~~/config/network'
import useNetworkConfig from '~~/hooks/useNetworkConfig'
import clsx from 'clsx'

const SECRET = 'secret'

async function encryptText(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'PBKDF2' }, false, ['deriveKey'])
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data))
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  return btoa([...combined].map((b) => String.fromCharCode(b)).join(''))
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/file/upload-patent', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Failed to upload image')
  const { url } = await res.json()
  return url
}

export default function PatentForm() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState(() => Date.now().toString());

  const [notificationId, setNotificationId] = useState<string>()
  const [digest, setDigest] = useState<string>()

  const currentAccount = useCurrentAccount()
  const { useNetworkVariable } = useNetworkConfig()
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)

  const { transact: createPatent } = useTransact({
    onBeforeStart: () => setNotificationId(notification.txLoading()),
    onSuccess: (tx: SuiSignAndExecuteTransactionOutput) =>
      // notification.txSuccess(transactionUrl(explorerUrl, tx.digest), notificationId),
      notification.loading("about to show transaction details!"),
    onError: (e: Error) => notification.txError(e, null, notificationId),
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.slice(0, 6))
  }

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!file || code.length !== 6) {
      notification.error(null, 'Upload an image and enter a 6-digit code.')
      return
    }

    try {
      // Upload image as is (no encryption)
      const uploadedUrl = await uploadImage(file)

      // Encrypt only the code
      const encryptedCode = await encryptText(code, SECRET)

      const encryptedUrl = await encryptText(uploadedUrl, SECRET)

      // Prepare and send the transaction with encrypted code and image URL
      // const tx = prepareCreatePatentTransaction(packageId, encryptedCode, encryptedUrl)
      // await createPatent(tx)
    } catch (err) {
      notification.error(err as Error, 'Failed to upload or create patent.')
    }
  }

  const handleSubmitb = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file || code.length !== 6 || !name || !description) {
      notification.error(null, 'Upload image, enter 6-digit code, name, and description.');
      return;
    }

    try {
      const uploadedUrl = await uploadImage(file);
      const encryptedUrl = await encryptText(uploadedUrl, SECRET)
      const encryptedCode = await encryptText(code, SECRET);
      const encryptedName = await encryptText(name, SECRET);
      const encryptedDescription = await encryptText(description, SECRET);
      const encryptedDate = await encryptText(createdAt, SECRET);


      // const tx = prepareCreatePatentTransaction(packageId, encryptedCode, encryptedUrl)
      // await createPatent(tx)

      const res = await fetch('/api/patent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedCode,
          imageUrl: encryptedUrl,
          // sender: currentAccount?.address,
          sender: "0x505fb5891fe7696b923cb60fa8862ed700b586692336957919c1dc7e252b1799"
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Transaction failed');

      console.log("the digest is", result.digest)

      setDigest(result.digest)

      console.log("the stored digest is", digest)

      notification.txSuccess(transactionUrl(explorerUrl, result.digest), notificationId),
        console.log(result.output);
    } catch (err) {
      notification.error(err as Error, 'Failed to upload or create patent.');
    }
  };



  const handleSubmitc = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file || code.length !== 6 || !name || !description) {
      notification.error(null, 'Upload image, enter 6-digit code, name, and description.');
      return;
    }

    try {
      const uploadedUrl = await uploadImage(file);

      // Encrypt all strings
      const encryptedName = await encryptText(name, SECRET);
      const encryptedDescription = await encryptText(description, SECRET);
      const encryptedCode = await encryptText(code, SECRET);
      const encryptedUrl = await encryptText(uploadedUrl, SECRET);
      const encryptedDate = await encryptText(createdAt, SECRET);

      // Prepare transaction with all encrypted params (in correct order)
      const tx = prepareCreatePatentTransaction(
        packageId,
        encryptedName,
        encryptedDescription,
        encryptedCode,
        encryptedUrl,
        encryptedDate
      );
      await createPatent(tx);

      // Send POST with all encrypted fields and sender
      const res = await fetch('/api/patent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedName,
          encryptedDescription,
          encryptedCode,
          imageUrl: encryptedUrl,
          createdAt: encryptedDate,
          // sender: currentAccount?.address || "0x505fb5891fe7696b923cb60fa8862ed700b586692336957919c1dc7e252b1799",
          sender: "0x505fb5891fe7696b923cb60fa8862ed700b586692336957919c1dc7e252b1799",
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Transaction failed');

      console.log("the digest is", result.digest);
      setDigest(result.digest);
      notification.txSuccess(transactionUrl(explorerUrl, result.digest), notificationId);
    } catch (err) {
      notification.error(err as Error, 'Failed to upload or create patent.');
    }
  };



  if (!currentAccount) return <CustomConnectButton />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 max-w-6xl mx-auto items-start">
      {/* Preview Section */}
      <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border h-[400px] flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
        ) : (
          <p className="text-gray-500">Preview will appear here</p>
        )}
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-6">
        <label
          htmlFor="file"
          className={clsx(
            'cursor-pointer border-2 border-dashed rounded-lg px-4 py-10 text-center',
            'hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
          )}
        >
          <p className="text-sm text-gray-500">Click or drag an image here</p>
          <p className="text-xs mt-2 text-gray-400">Only image files accepted</p>
          <input
            id="file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* <TextField.Root size="3" placeholder="Enter 6-digit code" value={code} onChange={handleCodeChange} /> */}

        <TextField.Root
          size="3"
          placeholder="Enter Patent Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField.Root
          size="3"
          placeholder="Enter Patent Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField.Root
          size="3"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={handleCodeChange}
        />

        {/* <TextField.Root
          size="3"
          placeholder="Enter Creation Date (YYYY-MM-DD or timestamp)"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
        /> */}

        <Button variant="solid" size="4" onClick={handleSubmitc}>
          Submit Patent
        </Button>
      </div>
    </div>
  )
}
