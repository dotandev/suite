"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Badge } from "../../ui/badge"
import { Separator } from "../../ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { ScrollArea } from "../../ui/scroll-area"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Edit, Users, MessageSquare, Upload, FileText, Video, Music, ImageIcon } from "lucide-react"
import { useCurrentAccount } from "@mysten/dapp-kit"

interface Party {
  id: string
  address: string
  email: string
  role: "creator" | "signatory" | "viewer"
  has_signed: boolean
}

interface EditRequest {
  id: string
  proposer_address: string
  proposer_email: string
  section_start: number
  section_end: number
  original_content: string
  proposed_content: string
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface Agreement {
  id: string
  title: string
  content: string
  media_type: "text" | "document" | "video" | "audio"
  media_url: string
  status: "draft" | "pending_approval" | "approved" | "on_chain"
  creator_address: string
  parties: Party[]
  edit_requests: EditRequest[]
}

interface DocumentEditorProps {
  agreementId?: string
  onSave?: (agreement: Agreement) => void
}

export default function DocumentEditor({ agreementId, onSave }: DocumentEditorProps) {
  const [agreement, setAgreement] = useState<Agreement | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0, text: "" })
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editReason, setEditReason] = useState("")
  const [proposedContent, setProposedContent] = useState("")
  const [newPartyEmail, setNewPartyEmail] = useState("")
  const [newPartyAddress, setNewPartyAddress] = useState("")
  const [mediaType, setMediaType] = useState<"text" | "document" | "video" | "audio">("text")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const currentAccount = useCurrentAccount()

  useEffect(() => {
    if (agreementId) {
      fetchAgreement()
    } else {
      // Create new agreement
      setAgreement({
        id: "",
        title: "New Agreement",
        content: "",
        media_type: "text",
        media_url: "",
        status: "draft",
        creator_address: currentAccount?.address || "",
        parties: [],
        edit_requests: [],
      })
      setIsEditing(true)
    }
  }, [agreementId, currentAccount])

  const fetchAgreement = async () => {
    try {
      const response = await fetch(`/api/agreements/${agreementId}`)
      const data = await response.json()
      setAgreement(data.agreement)
      setEditContent(data.agreement.content || "")
    } catch (error) {
      console.error("Error fetching agreement:", error)
    }
  }

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selectedText = editContent.substring(start, end)

      if (selectedText.length > 0) {
        setSelectedText({ start, end, text: selectedText })
        setProposedContent(selectedText)
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const saveAgreement = async () => {
    if (!agreement) return

    try {
      let mediaUrl = agreement.media_url

      // Upload file if there's one
      if (uploadedFile) {
        mediaUrl = await handleFileUpload(uploadedFile)
        if (!mediaUrl) return
      }

      const agreementData = {
        ...agreement,
        content: editContent,
        media_type: mediaType,
        media_url: mediaUrl,
      }

      let response
      if (agreement.id) {
        // Update existing agreement
        response = await fetch(`/api/agreements/${agreement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agreementData),
        })
      } else {
        // Create new agreement
        response = await fetch("/api/agreements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...agreementData,
            creator_address: currentAccount?.address,
            creator_email: "", // You might want to get this from user input
            parties: agreement.parties,
          }),
        })
      }

      const data = await response.json()
      setAgreement(data.agreement)
      setIsEditing(false)
      onSave?.(data.agreement)
    } catch (error) {
      console.error("Error saving agreement:", error)
    }
  }

  const requestEdit = async () => {
    if (!agreement || !selectedText.text || !proposedContent) return

    try {
      await fetch(`/api/agreements/${agreement.id}/edit-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposer_address: currentAccount?.address,
          proposer_email: "", // Get from user input
          section_start: selectedText.start,
          section_end: selectedText.end,
          original_content: selectedText.text,
          proposed_content: proposedContent,
          reason: editReason,
        }),
      })

      setShowEditDialog(false)
      setEditReason("")
      setProposedContent("")
      fetchAgreement() // Refresh to show new edit request
    } catch (error) {
      console.error("Error requesting edit:", error)
    }
  }

  const approveEdit = async (editRequestId: string, approved: boolean, comment = "") => {
    try {
      await fetch(`/api/edit-requests/${editRequestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_address: currentAccount?.address,
          party_email: "", // Get from user input
          approved,
          comment,
        }),
      })

      fetchAgreement() // Refresh to show updated status
    } catch (error) {
      console.error("Error approving edit:", error)
    }
  }

  const addParty = async () => {
    if (!agreement || !newPartyEmail || !newPartyAddress) return

    const newParty = {
      address: newPartyAddress,
      email: newPartyEmail,
      role: "signatory" as const,
    }

    setAgreement({
      ...agreement,
      parties: [...agreement.parties, { ...newParty, id: Date.now().toString(), has_signed: false }],
    })

    setNewPartyEmail("")
    setNewPartyAddress("")
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  if (!agreement) return <div>Loading...</div>

  const canEdit =
    agreement.creator_address === currentAccount?.address ||
    agreement.parties.some((p) => p.address === currentAccount?.address && p.role !== "viewer")

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getMediaIcon(agreement.media_type)}
              {isEditing ? (
                <Input
                  value={agreement.title}
                  onChange={(e) => setAgreement({ ...agreement, title: e.target.value })}
                  className="text-xl font-bold"
                />
              ) : (
                agreement.title
              )}
            </CardTitle>
            <Badge 
            // variant={agreement.status === "approved" ? "default" : "secondary"}
            >
              {agreement.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <Button onClick={saveAgreement} disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Save"}
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Type Selection */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Media Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={mediaType} onValueChange={(value: any) => setMediaType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Document</SelectItem>
                    <SelectItem value="document">File Upload</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>

                {mediaType !== "text" && (
                  <div>
                    <Label htmlFor="file-upload">Upload File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept={
                        mediaType === "video" ? "video/*" : mediaType === "audio" ? "audio/*" : ".pdf,.doc,.docx,.txt"
                      }
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement Content</CardTitle>
            </CardHeader>
            <CardContent>
              {agreement.media_url && agreement.media_type !== "text" ? (
                <div className="space-y-4">
                  {agreement.media_type === "video" && (
                    <video controls className="w-full max-h-96">
                      <source src={agreement.media_url} />
                    </video>
                  )}
                  {agreement.media_type === "audio" && (
                    <audio controls className="w-full">
                      <source src={agreement.media_url} />
                    </audio>
                  )}
                  {agreement.media_type === "document" && (
                    <div className="p-4 border rounded-lg">
                      <a
                        href={agreement.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      ref={textareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onSelect={handleTextSelection}
                      placeholder="Enter agreement content..."
                      className="min-h-[400px]"
                    />
                  ) : (
                    <div className="min-h-[400px] p-4 border rounded-lg whitespace-pre-wrap">
                      {agreement.content || "No content yet..."}
                    </div>
                  )}

                  {!isEditing && canEdit && selectedText.text && (
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Edit className="h-4 w-4 mr-2" />
                          Request Edit for Selected Text
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Edit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Original Text</Label>
                            <div className="p-2 bg-gray-100 rounded text-sm">{selectedText.text}</div>
                          </div>
                          <div>
                            <Label htmlFor="proposed-content">Proposed Content</Label>
                            <Textarea
                              id="proposed-content"
                              value={proposedContent}
                              onChange={(e) => setProposedContent(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-reason">Reason for Edit</Label>
                            <Textarea
                              id="edit-reason"
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              placeholder="Explain why this edit is needed..."
                            />
                          </div>
                          <Button onClick={requestEdit} className="w-full">
                            Submit Edit Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Requests */}
          {agreement.edit_requests && agreement.edit_requests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {agreement.edit_requests.map((editRequest) => (
                      <div key={editRequest.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge
                            //   variant={
                            //     editRequest.status === "approved"
                            //       ? "default"
                            //       : editRequest.status === "rejected"
                            //         ? "destructive"
                            //         : "secondary"
                            //   }
                            >
                              {editRequest.status}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              By: {editRequest.proposer_address.slice(0, 8)}...
                            </p>
                          </div>
                          {editRequest.status === "pending" && canEdit && (
                            <div className="flex gap-2">
                              <Button onClick={() => approveEdit(editRequest.id, true)}>
                                Approve
                              </Button>
                              <Button onClick={() => approveEdit(editRequest.id, false)}>
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Original:</Label>
                            <p className="text-sm bg-red-50 p-2 rounded">{editRequest.original_content}</p>
                          </div>
                          <div>
                            <Label className="text-xs">Proposed:</Label>
                            <p className="text-sm bg-green-50 p-2 rounded">{editRequest.proposed_content}</p>
                          </div>
                          {editRequest.reason && (
                            <div>
                              <Label className="text-xs">Reason:</Label>
                              <p className="text-sm text-gray-600">{editRequest.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Parties ({agreement.parties.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {agreement.parties.map((party) => (
                    <div key={party.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{party.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{party.email}</p>
                          <p className="text-xs text-gray-500">{party.address.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="text-xs">
                          {party.role}
                        </Badge>
                        {party.has_signed && (
                          <Badge className="text-xs">
                            Signed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {isEditing && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Input
                      placeholder="Email address"
                      value={newPartyEmail}
                      onChange={(e) => setNewPartyEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Wallet address"
                      value={newPartyAddress}
                      onChange={(e) => setNewPartyAddress(e.target.value)}
                    />
                    <Button onClick={addParty} className="w-full">
                      Add Party
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent">
                <MessageSquare className="h-4 w-4 mr-2" />
                Summarize Document
              </Button>
              <Button className="w-full bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Upload to Contract
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
