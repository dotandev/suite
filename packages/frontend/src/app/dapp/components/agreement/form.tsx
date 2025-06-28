"use client";

import { Button, TextField } from "@radix-ui/themes";
import { useState, ChangeEvent, MouseEvent } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import useTransact from "@suiware/kit/useTransact";
import useNetworkConfig from "~~/hooks/useNetworkConfig";
import { notification } from "~~/helpers/notification";
import { prepareCreateAgreementTransaction } from "~~/dapp/helpers/transactions";
import CustomConnectButton from "~~/components/CustomConnectButton";
import { transactionUrl } from "~~/helpers/network";
import { CONTRACT_PACKAGE_VARIABLE_NAME, EXPLORER_URL_VARIABLE_NAME } from "~~/config/network";


export async function sha256(data: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return new Uint8Array(digest);
  }

const AgreementForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<string>("");
  const [signatories, setSignatories] = useState<string>("");
  const { useNetworkVariable } = useNetworkConfig();
  const currentAccount = useCurrentAccount();
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME);
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME);
  const [notificationId, setNotificationId] = useState<string>();

  const { transact: createAgreement } = useTransact({
    onBeforeStart: () => setNotificationId(notification.txLoading()),
    onSuccess: (res) => notification.txSuccess(transactionUrl(explorerUrl, res.digest), notificationId),
    onError: (err) => notification.txError(err, null, notificationId),
  });

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!file || !metadata || !signatories) {
      notification.error(null, "Please fill all fields.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const mediaStr = reader.result as string;
      const mediaHash = await sha256(mediaStr);
      const metadataHash = await sha256(metadata);
      const signatoryArray = signatories.split(",").map((s) => s.trim());

      const tx = prepareCreateAgreementTransaction(packageId, mediaHash, metadataHash, signatoryArray);
      createAgreement(tx);
    };
    reader.readAsDataURL(file);
  };

  if (!currentAccount) return <CustomConnectButton />;

  return (
    <div className="flex flex-col gap-4 items-center">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <TextField.Root placeholder="Enter metadata (e.g. location...)" onChange={(e) => setMetadata(e.target.value)} />
      <TextField.Root placeholder="Comma-separated signatories..." onChange={(e) => setSignatories(e.target.value)} />
      <Button variant="solid" onClick={handleSubmit}>Create Agreement</Button>
    </div>
  );
};

export default AgreementForm;