export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          user_type: 'builder' | 'contractor'
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone: string
          user_type: 'builder' | 'contractor'
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          user_type?: 'builder' | 'contractor'
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contractors: {
        Row: {
          id: string
          user_id: string
          specializations: string[]
          experience_years: number | null
          team_size: number | null
          service_locations: string[]
          bio: string | null
          portfolio_images: string[]
          rating: number
          total_projects: number
          verification_status: 'pending' | 'verified' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specializations: string[]
          experience_years?: number | null
          team_size?: number | null
          service_locations: string[]
          bio?: string | null
          portfolio_images?: string[]
          rating?: number
          total_projects?: number
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specializations?: string[]
          experience_years?: number | null
          team_size?: number | null
          service_locations?: string[]
          bio?: string | null
          portfolio_images?: string[]
          rating?: number
          total_projects?: number
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          builder_id: string
          title: string
          description: string
          project_type: string
          location: string
          city: string
          required_specializations: string[]
          budget_min: number | null
          budget_max: number | null
          start_date: string | null
          duration_days: number | null
          status: 'open' | 'bidding_closed' | 'awarded' | 'completed' | 'cancelled'
          document_url: string | null
          created_at: string
          bidding_deadline: string
        }
        Insert: {
          id?: string
          builder_id: string
          title: string
          description: string
          project_type: string
          location: string
          city: string
          required_specializations: string[]
          budget_min?: number | null
          budget_max?: number | null
          start_date?: string | null
          duration_days?: number | null
          status?: 'open' | 'bidding_closed' | 'awarded' | 'completed' | 'cancelled'
          document_url?: string | null
          created_at?: string
          bidding_deadline: string
        }
        Update: {
          id?: string
          builder_id?: string
          title?: string
          description?: string
          project_type?: string
          location?: string
          city?: string
          required_specializations?: string[]
          budget_min?: number | null
          budget_max?: number | null
          start_date?: string | null
          duration_days?: number | null
          status?: 'open' | 'bidding_closed' | 'awarded' | 'completed' | 'cancelled'
          document_url?: string | null
          created_at?: string
          bidding_deadline?: string
        }
      }
      bids: {
        Row: {
          id: string
          project_id: string
          contractor_id: string
          quoted_price: number
          estimated_duration: number
          proposal: string
          attachments: string[]
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          contractor_id: string
          quoted_price: number
          estimated_duration: number
          proposal: string
          attachments?: string[]
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          contractor_id?: string
          quoted_price?: number
          estimated_duration?: number
          proposal?: string
          attachments?: string[]
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          project_id: string
          builder_id: string | null
          contractor_id: string | null
          rating: number
          review_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          builder_id?: string | null
          contractor_id?: string | null
          rating: number
          review_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          builder_id?: string | null
          contractor_id?: string | null
          rating?: number
          review_text?: string | null
          created_at?: string
        }
      }
    }
  }
}
