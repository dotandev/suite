import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../../../lib/supabase"


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { party_address, party_email, approved, comment } = body

    // Record the approval/rejection
    const { error: approvalError } = await supabase.from("edit_approvals").insert({
      edit_request_id: params.id,
      party_address,
      party_email,
      approved,
      comment,
    })

    if (approvalError) throw approvalError

    // Check if all parties have approved
    const { data: editRequest, error: editError } = await supabase
      .from("edit_requests")
      .select(`
        *,
        agreements!inner (
          parties (address, role)
        )
      `)
      .eq("id", params.id)
      .single()

    if (editError) throw editError

    const { data: approvals, error: approvalsError } = await supabase
      .from("edit_approvals")
      .select("*")
      .eq("edit_request_id", params.id)

    if (approvalsError) throw approvalsError

    const signatoryParties = editRequest.agreements.parties.filter(
      (p: any) => p.role === "signatory" || p.role === "creator",
    )
    const approvedCount = approvals.filter((a) => a.approved).length
    const rejectedCount = approvals.filter((a) => !a.approved).length

    let newStatus = "pending"
    if (rejectedCount > 0) {
      newStatus = "rejected"
    } else if (approvedCount === signatoryParties.length) {
      newStatus = "approved"
    }

    // Update edit request status
    const { error: updateError } = await supabase
      .from("edit_requests")
      .update({ status: newStatus })
      .eq("id", params.id)

    if (updateError) throw updateError

    // If approved, update the agreement content
    if (newStatus === "approved") {
      const { error: contentUpdateError } = await supabase
        .from("agreements")
        .update({
          content: editRequest.proposed_content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editRequest.agreement_id)

      if (contentUpdateError) throw contentUpdateError
    }

    return NextResponse.json({ status: newStatus })
  } catch (error) {
    console.error("Error processing approval:", error)
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 })
  }
}
