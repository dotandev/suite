import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../../../lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { proposer_address, proposer_email, section_start, section_end, original_content, proposed_content, reason } =
      body

    const { data: editRequest, error } = await supabase
      .from("edit_requests")
      .insert({
        agreement_id: params.id,
        proposer_address,
        proposer_email,
        section_start,
        section_end,
        original_content,
        proposed_content,
        reason,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ editRequest })
  } catch (error) {
    console.error("Error creating edit request:", error)
    return NextResponse.json({ error: "Failed to create edit request" }, { status: 500 })
  }
}
