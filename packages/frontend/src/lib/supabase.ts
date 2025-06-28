import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      agreements: {
        Row: {
          id: string
          title: string
          content: string | null
          media_type: "text" | "document" | "video" | "audio" | null
          media_url: string | null
          encrypted_link: string | null
          cloudinary_url: string | null
          creator_address: string
          creator_email: string | null
          status: "draft" | "pending_approval" | "approved" | "on_chain"
          sui_object_id: string | null
          metadata_hash: string | null
          media_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          media_type?: "text" | "document" | "video" | "audio" | null
          media_url?: string | null
          encrypted_link?: string | null
          cloudinary_url?: string | null
          creator_address: string
          creator_email?: string | null
          status?: "draft" | "pending_approval" | "approved" | "on_chain"
          sui_object_id?: string | null
          metadata_hash?: string | null
          media_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          media_type?: "text" | "document" | "video" | "audio" | null
          media_url?: string | null
          encrypted_link?: string | null
          cloudinary_url?: string | null
          creator_address?: string
          creator_email?: string | null
          status?: "draft" | "pending_approval" | "approved" | "on_chain"
          sui_object_id?: string | null
          metadata_hash?: string | null
          media_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parties: {
        Row: {
          id: string
          agreement_id: string
          address: string
          email: string
          role: "creator" | "signatory" | "viewer"
          has_signed: boolean
          invited_at: string
          signed_at: string | null
        }
        Insert: {
          id?: string
          agreement_id: string
          address: string
          email: string
          role?: "creator" | "signatory" | "viewer"
          has_signed?: boolean
          invited_at?: string
          signed_at?: string | null
        }
        Update: {
          id?: string
          agreement_id?: string
          address?: string
          email?: string
          role?: "creator" | "signatory" | "viewer"
          has_signed?: boolean
          invited_at?: string
          signed_at?: string | null
        }
      }
      edit_requests: {
        Row: {
          id: string
          agreement_id: string
          proposer_address: string
          proposer_email: string | null
          section_start: number | null
          section_end: number | null
          original_content: string | null
          proposed_content: string
          reason: string | null
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agreement_id: string
          proposer_address: string
          proposer_email?: string | null
          section_start?: number | null
          section_end?: number | null
          original_content?: string | null
          proposed_content: string
          reason?: string | null
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agreement_id?: string
          proposer_address?: string
          proposer_email?: string | null
          section_start?: number | null
          section_end?: number | null
          original_content?: string | null
          proposed_content?: string
          reason?: string | null
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
      }
      edit_approvals: {
        Row: {
          id: string
          edit_request_id: string
          party_address: string
          party_email: string | null
          approved: boolean
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          edit_request_id: string
          party_address: string
          party_email?: string | null
          approved: boolean
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          edit_request_id?: string
          party_address?: string
          party_email?: string | null
          approved?: boolean
          comment?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          agreement_id: string | null
          edit_request_id: string | null
          author_address: string
          author_email: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          agreement_id?: string | null
          edit_request_id?: string | null
          author_address: string
          author_email?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          agreement_id?: string | null
          edit_request_id?: string | null
          author_address?: string
          author_email?: string | null
          content?: string
          created_at?: string
        }
      }
    }
  }
}
