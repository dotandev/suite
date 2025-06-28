import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../../lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: agreement, error } = await supabase
      .from("agreements")
      .select(`
        *,
        parties (*),
        edit_requests (*),
        comments (*)
      `)
      .eq("id", params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ agreement })
  } catch (error) {
    console.error("Error fetching agreement:", error)
    return NextResponse.json({ error: "Failed to fetch agreement" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { content, status, sui_object_id, metadata_hash, media_hash } = body

    const { data: agreement, error } = await supabase
      .from("agreements")
      .update({
        content,
        status,
        sui_object_id,
        metadata_hash,
        media_hash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ agreement })
  } catch (error) {
    console.error("Error updating agreement:", error)
    return NextResponse.json({ error: "Failed to update agreement" }, { status: 500 })
  }
}
