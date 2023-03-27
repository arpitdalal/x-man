export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          expense: boolean
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expense?: boolean
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expense?: boolean
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      expenses: {
        Row: {
          amount: string
          categories: string | null
          created_at: string | null
          day: string
          id: string
          month: string
          title: string
          updated_at: string | null
          user_id: string
          year: string
        }
        Insert: {
          amount: string
          categories?: string | null
          created_at?: string | null
          day: string
          id?: string
          month: string
          title: string
          updated_at?: string | null
          user_id: string
          year: string
        }
        Update: {
          amount?: string
          categories?: string | null
          created_at?: string | null
          day?: string
          id?: string
          month?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          year?: string
        }
      }
      income: {
        Row: {
          addInTenPer: boolean
          amount: string
          categories: string | null
          created_at: string | null
          day: string
          id: string
          month: string
          title: string
          updated_at: string | null
          user_id: string
          year: string
        }
        Insert: {
          addInTenPer?: boolean
          amount: string
          categories?: string | null
          created_at?: string | null
          day: string
          id?: string
          month: string
          title: string
          updated_at?: string | null
          user_id: string
          year: string
        }
        Update: {
          addInTenPer?: boolean
          amount?: string
          categories?: string | null
          created_at?: string | null
          day?: string
          id?: string
          month?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          year?: string
        }
      }
      preferences: {
        Row: {
          "2fa": boolean
          "2fa_backup": string | null
          "2fa_key": string | null
          created_at: string | null
          id: string
          sidebar: boolean
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          "2fa"?: boolean
          "2fa_backup"?: string | null
          "2fa_key"?: string | null
          created_at?: string | null
          id?: string
          sidebar?: boolean
          theme?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          "2fa"?: boolean
          "2fa_backup"?: string | null
          "2fa_key"?: string | null
          created_at?: string | null
          id?: string
          sidebar?: boolean
          theme?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      presets: {
        Row: {
          amount: string
          categories: string | null
          created_at: string | null
          expense: boolean
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: string
          categories?: string | null
          created_at?: string | null
          expense?: boolean
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: string
          categories?: string | null
          created_at?: string | null
          expense?: boolean
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          is_onboarded: boolean
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_onboarded?: boolean
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_onboarded?: boolean
          name?: string
          updated_at?: string | null
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
