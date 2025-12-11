/**
 * Типы базы данных Supabase
 * 
 * Эти типы будут автоматически сгенерированы после создания таблиц в Supabase.
 * Временно используем базовую структуру.
 * 
 * После создания таблиц в Supabase:
 * 1. Установить Supabase CLI: npm install supabase --save-dev
 * 2. Выполнить: npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
 */

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
      organizations: {
        Row: {
          id: string
          org_type: 'school' | 'university' | 'kindergarten' | 'center' | 'course'
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          phone: string | null
          email: string | null
          website: string | null
          address: string | null
          district: string | null
          city: string | null
          lat: number | null
          lng: number | null
          status: 'active' | 'inactive' | 'pending'
          is_verified: boolean
          overall_rating: number | null
          reviews_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at' | 'reviews_count'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      school_details: {
        Row: {
          id: string
          organization_id: string
          school_type: 'private' | 'state' | 'international'
          grade_from: number
          grade_to: number
          total_students: number | null
          avg_class_size: number | null
          primary_language: string
          additional_languages: string[] | null
          curriculum: ('national' | 'cambridge' | 'ib')[] | null
          fee_monthly_min: number | null
          fee_monthly_max: number | null
          has_transport: boolean
          has_meals: boolean
          has_extended_day: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['school_details']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['school_details']['Insert']>
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
  }
}

