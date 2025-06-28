import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "../../../lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    // Get agreements where user is creator or party
    const { data: agreements, error } = await supabase
      .from("agreements")
      .select(`
        *,
        parties (
          address,
          email,
          role,
          has_signed
        )
      `)
      .or(`creator_address.eq.${address},parties.address.eq.${address}`)

    if (error) throw error

    return NextResponse.json({ agreements })
  } catch (error) {
    console.error("Error fetching agreements:", error)
    return NextResponse.json({ error: "Failed to fetch agreements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, media_type, media_url, creator_address, creator_email, parties } = body

    // Create agreement
    const { data: agreement, error: agreementError } = await supabase
      .from("agreements")
      .insert({
        title,
        content,
        media_type,
        media_url,
        creator_address,
        creator_email,
        status: "draft",
      })
      .select()
      .single()

    if (agreementError) throw agreementError

    // Add creator as a party
    const partiesToInsert = [
      {
        agreement_id: agreement.id,
        address: creator_address,
        email: creator_email,
        role: "creator" as const,
      },
      ...parties.map((party: any) => ({
        agreement_id: agreement.id,
        address: party.address,
        email: party.email,
        role: "signatory" as const,
      })),
    ]

    const { error: partiesError } = await supabase.from("parties").insert(partiesToInsert)

    if (partiesError) throw partiesError

    return NextResponse.json({ agreement })
  } catch (error) {
    console.error("Error creating agreement:", error)
    return NextResponse.json({ error: "Failed to create agreement" }, { status: 500 })
  }
}
