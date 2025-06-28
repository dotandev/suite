"use client"

import type React from "react"

import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Label } from "../../ui/label"
import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import useTransact from "@suiware/kit/useTransact"
import useNetworkConfig from "~~/hooks/useNetworkConfig"
import { notification } from "~~/helpers/notification"
import { prepareCreateAgreementTransaction } from "~~/dapp/helpers/transactions"
import CustomConnectButton from "~~/components/CustomConnectButton"
import { transactionUrl } from "~~/helpers/network"
import { CONTRACT_PACKAGE_VARIABLE_NAME, EXPLORER_URL_VARIABLE_NAME } from "~~/config/network"

export async function sha256(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const buffer = encoder.encode(data)
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  return new Uint8Array(digest)
}

interface Agreement {
  id: string
  title: string
  content: string
  media_url: string
  parties: Array<{
    address: string
    email: string
  }>
}

interface EnhancedAgreementFormProps {
  agreement?: Agreement
  onSuccess?: () => void
}

export default function EnhancedAgreementForm({ agreement, onSuccess }: EnhancedAgreementFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<string>("")
  const [signatories, setSignatories] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  const { useNetworkVariable } = useNetworkConfig()
  const currentAccount = useCurrentAccount()
  const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
  const explorerUrl = useNetworkVariable(EXPLORER_URL_VARIABLE_NAME)
  const [notificationId, setNotificationId] = useState<string>()

  const { transact: createAgreement } = useTransact({
    onBeforeStart: () => setNotificationId(notification.txLoading()),
    onSuccess: async (res) => {
      notification.txSuccess(transactionUrl(explorerUrl, res.digest), notificationId)

      // Update agreement in database with Sui object ID
      if (agreement) {
        try {
          await fetch(`/api/agreements/${agreement.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            //   sui_object_id: res.objectChanges?.[0]?.objectId,
              status: "on_chain",
              metadata_hash: await sha256(metadata),
              media_hash: file ? await sha256(await file.text()) : await sha256(agreement.content),
            }),
          })
        } catch (error) {
          console.error("Error updating agreement:", error)
        }
      }

      onSuccess?.()
    },
    onError: (err) => notification.txError(err, null, notificationId),
  })

  useEffect(() => {
    if (agreement) {
      setMetadata(agreement.title)
      setSignatories(agreement.parties.map((p) => p.address).join(", "))
    }
  }, [agreement])

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!agreement && (!file || !metadata || !signatories)) {
      notification.error(null, "Please fill all fields.")
      return
    }

    if (agreement && !metadata) {
      notification.error(null, "Please provide metadata.")
      return
    }

    try {
      let mediaStr = ""
      let mediaHash: Uint8Array

      if (file) {
        const reader = new FileReader()
        mediaStr = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        mediaHash = await sha256(mediaStr)
      } else if (agreement) {
        // Use existing agreement content or media
        mediaStr = agreement.content || agreement.media_url
        mediaHash = await sha256(mediaStr)
      } else {
        notification.error(null, "No content to upload.")
        return
      }

      const metadataHash = await sha256(metadata)
      const signatoryArray = signatories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const tx = prepareCreateAgreementTransaction(packageId, mediaHash, metadataHash, signatoryArray)
      await createAgreement(tx)
    } catch (error) {
      console.error("Error creating agreement:", error)
      notification.error(null, "Failed to create agreement.")
    }
  }

  if (!currentAccount) return <CustomConnectButton />

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{agreement ? "Upload Agreement to Blockchain" : "Create New Agreement"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {agreement ? (
          <div className="space-y-4">
            <div>
              <Label>Agreement Title</Label>
              <div className="p-2 bg-gray-50 rounded text-sm">{agreement.title}</div>
            </div>

            <div>
              <Label>Content Preview</Label>
              <div className="p-2 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                {agreement.content?.slice(0, 200)}...
              </div>
            </div>

            <div>
              <Label>Parties</Label>
              <div className="space-y-1">
                {agreement.parties.map((party, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    {party.email} ({party.address.slice(0, 8)}...)
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="file-upload">Upload Agreement File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.txt,video/*,audio/*"
            />
          </div>
        )}

        <div>
          <Label htmlFor="metadata">Metadata</Label>
          <Textarea
            id="metadata"
            placeholder="Enter agreement metadata (title, description, location, etc.)"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
          />
        </div>

        {!agreement && (
          <div>
            <Label htmlFor="signatories">Signatories</Label>
            <Textarea
              id="signatories"
              placeholder="Comma-separated wallet addresses of signatories"
              value={signatories}
              onChange={(e) => setSignatories(e.target.value)}
            />
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full" disabled={isUploading}>
          {isUploading ? "Processing..." : agreement ? "Upload to Blockchain" : "Create Agreement"}
        </Button>
      </CardContent>
    </Card>
  )
}
