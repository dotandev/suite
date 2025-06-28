"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Badge } from "../../../ui/badge"
import { Input } from "../../../ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog"
import { Plus, FileText, Video, Music, Users } from "lucide-react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import DocumentEditor from "~~/components/editor"

interface Agreement {
    id: string
    title: string
    content: string
    media_type: "text" | "document" | "video" | "audio"
    status: "draft" | "pending_approval" | "approved" | "on_chain"
    creator_address: string
    created_at: string
    parties: Array<{
        address: string
        email: string
        role: string
        has_signed: boolean
    }>
}

export default function AgreementsPage() {
    const [agreements, setAgreements] = useState<Agreement[]>([])
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null)
    const currentAccount = useCurrentAccount()

    useEffect(() => {
        if (currentAccount?.address) {
            fetchAgreements()
        }
    }, [currentAccount])

    const fetchAgreements = async () => {
        if (!currentAccount?.address) return

        try {
            const response = await fetch(`/api/agreements?address=${currentAccount.address}`)
            const data = await response.json()
            setAgreements(data.agreements || [])
        } catch (error) {
            console.error("Error fetching agreements:", error)
        }
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
                return <FileText className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "default"
            case "on_chain":
                return "default"
            case "pending_approval":
                return "secondary"
            default:
                return "outline"
        }
    }

    const filteredAgreements = agreements.filter(
        (agreement) =>
            agreement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agreement.creator_address.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (selectedAgreement) {
        return (
            <div>
                <Button onClick={() => setSelectedAgreement(null)} className="mb-4">
                    ← Back to Agreements
                </Button>
                <DocumentEditor
                    agreementId={selectedAgreement}
                    onSave={() => {
                        fetchAgreements()
                        setSelectedAgreement(null)
                    }}
                />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Agreements</h1>
                    <p className="text-gray-600">Manage your digital agreements</p>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Agreement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Agreement</DialogTitle>
                        </DialogHeader>
                        <DocumentEditor
                            onSave={(agreement) => {
                                fetchAgreements()
                                setShowCreateDialog(false)
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Search agreements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgreements.map((agreement) => (
                    <Card
                        key={agreement.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedAgreement(agreement.id)}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getMediaIcon(agreement.media_type)}
                                    <CardTitle className="text-lg truncate">{agreement.title}</CardTitle>
                                </div>
                                <Badge
                                // variant={getStatusColor(agreement.status)
                                >{agreement.status.replace("_", " ")}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {agreement.content || "No content preview available"}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Users className="h-4 w-4" />
                                    <span>{agreement.parties.length} parties</span>
                                    <span>•</span>
                                    <span>{agreement.parties.filter((p) => p.has_signed).length} signed</span>
                                </div>

                                <div className="text-xs text-gray-400">
                                    Created: {new Date(agreement.created_at).toLocaleDateString()}
                                </div>

                                <div className="text-xs text-gray-400">Creator: {agreement.creator_address.slice(0, 8)}...</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredAgreements.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No agreements found</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first agreement"}
                    </p>
                    {!searchTerm && (
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Agreement
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
