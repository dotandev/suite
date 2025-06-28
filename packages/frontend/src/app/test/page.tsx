"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { FileText, Users, Edit } from "lucide-react"
import AgreementsPage from "./id/page"
import NetworkSupportChecker from "~~/components/NetworkSupportChecker"
import EnhancedAgreementForm from "~~/components/agreement-form"


export default function Home() {
  return (
    <>
      <NetworkSupportChecker />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sui Agreement DApp</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create, edit, and manage digital agreements with blockchain security and collaborative editing
            </p>
          </div>

          <Tabs defaultValue="agreements" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="agreements">My Agreements</TabsTrigger>
              <TabsTrigger value="create">Quick Create</TabsTrigger>
            </TabsList>

            <TabsContent value="agreements" className="mt-8">
              <AgreementsPage />
            </TabsContent>

            <TabsContent value="create" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Document Editor
                      </CardTitle>
                      <CardDescription>
                        Create and edit agreements with rich text, media support, and collaborative features
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Party Management
                      </CardTitle>
                      <CardDescription>Add parties by email and address, manage roles and permissions</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Edit Approval
                      </CardTitle>
                      <CardDescription>Request edits, get approvals from all parties with comments</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                <EnhancedAgreementForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
