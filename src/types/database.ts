export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          address: string | null
          admin_user_id: string | null
          banner_url: string | null
          brand_id: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          detailed_description: string | null
          district: string | null
          email: string | null
          email_admission: string | null
          facebook: string | null
          founded_year: number | null
          google_maps_url: string | null
          id: string
          instagram: string | null
          is_verified: boolean
          landmark: string | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          motto: string | null
          name: string
          name_ru: string | null
          name_uz: string | null
          org_type: string
          overall_rating: number | null
          parent_organization_id: string | null
          phone: string | null
          phone_admission: string | null
          phone_admission_comment: string | null
          phone_secondary: string | null
          phone_secondary_comment: string | null
          region: string | null
          region_id: number | null
          district_id: number | null
          reviews_count: number
          short_description: string | null
          slug: string
          status: string
          telegram: string | null
          telegram_channel: string | null
          updated_at: string
          website: string | null
          yandex_maps_url: string | null
          youtube: string | null
        }
        Insert: {
          address?: string | null
          admin_user_id?: string | null
          banner_url?: string | null
          brand_id?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          detailed_          description?: string | null
          detailed_description?: string | null
          district?: string | null
          email?: string | null
          email_admission?: string | null
          facebook?: string | null
          founded_year?: number | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          is_verified?: boolean
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          motto?: string | null
          name: string
          name_ru?: string | null
          name_uz?: string | null
          org_type: string
          overall_rating?: number | null
          parent_organization_id?: string | null
          phone?: string | null
          phone_admission?: string | null
          phone_admission_comment?: string | null
          phone_secondary?: string | null
          phone_secondary_comment?: string | null
          region?: string | null
          region_id?: number | null
          district_id?: number | null
          reviews_count?: number
          short_description?: string | null
          slug: string
          status?: string
          telegram?: string | null
          telegram_channel?: string | null
          updated_at?: string
          website?: string | null
          yandex_maps_url?: string | null
          youtube?: string | null
        }
        Update: {
          address?: string | null
          admin_user_id?: string | null
          banner_url?: string | null
          brand_id?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          detailed_          description?: string | null
          detailed_description?: string | null
          district?: string | null
          email?: string | null
          email_admission?: string | null
          facebook?: string | null
          founded_year?: number | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          is_verified?: boolean
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          motto?: string | null
          name?: string
          name_ru?: string | null
          name_uz?: string | null
          org_type?: string
          overall_rating?: number | null
          parent_organization_id?: string | null
          phone?: string | null
          phone_admission?: string | null
          phone_admission_comment?: string | null
          phone_secondary?: string | null
          phone_secondary_comment?: string | null
          region?: string | null
          region_id?: number | null
          district_id?: number | null
          reviews_count?: number
          short_description?: string | null
          slug?: string
          status?: string
          telegram?: string | null
          telegram_channel?: string | null
          updated_at?: string
          website?: string | null
          yandex_maps_url?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "school_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_details: {
        Row: {
          accepted_grades: number[] | null
          accepts_preparatory: boolean
          accreditation_body: string | null
          additional_languages: string[] | null
          avg_class_size: number | null
          avg_teacher_experience_years: number | null
          classrooms_count: number | null
          clubs: string[] | null
          created_at: string
          curriculum: string[] | null
          entrance_fee: number | null
          extended_day_until: string | null
          extracurricular_activities: string[] | null
          fee_monthly_max: number | null
          fee_monthly_min: number | null
          grade_from: number
          grade_to: number
          pricing_tiers: Json | null
          has_cafeteria: boolean
          has_cctv: boolean
          has_computer_lab: boolean
          has_extended_day: boolean
          has_football_field: boolean
          has_foreign_teachers: boolean
          has_gym: boolean
          has_international_accreditation: boolean
          has_library: boolean
          has_meals: boolean
          has_medical_room: boolean
          has_psychologist: boolean
          has_saturday_classes: boolean
          has_science_labs: boolean
          has_security_24_7: boolean
          has_sibling_discount: boolean
          has_swimming_pool: boolean
          has_transport: boolean
          id: string
          lesson_duration: number | null
          lessons_per_day: number | null
          license_authority: string | null
          license_date: string | null
          license_number: string | null
          license_valid_until: string | null
          meal_fee_monthly: number | null
          native_english_speakers_count: number | null
          organization_id: string
          primary_language: string
          school_area_sqm: number | null
          school_end_time: string | null
          school_start_time: string | null
          school_type: string
          sibling_discount_percent: number | null
          sports_sections: string[] | null
          teachers_with_higher_ed_percent: number | null
          textbook_fee_yearly: number | null
          total_students: number | null
          total_teachers: number | null
          transport_fee_monthly: number | null
          uniform_fee: number | null
          updated_at: string
        }
        Insert: {
          accepted_grades?: number[] | null
          accepts_preparatory?: boolean
          accreditation_body?: string | null
          additional_languages?: string[] | null
          avg_class_size?: number | null
          avg_teacher_experience_years?: number | null
          classrooms_count?: number | null
          clubs?: string[] | null
          created_at?: string
          curriculum?: string[] | null
          entrance_fee?: number | null
          extended_day_until?: string | null
          extracurricular_activities?: string[] | null
          fee_monthly_max?: number | null
          fee_monthly_min?: number | null
          grade_from: number
          grade_to: number
          pricing_tiers?: Json | null
          has_cafeteria?: boolean
          has_cctv?: boolean
          has_computer_lab?: boolean
          has_extended_day?: boolean
          has_football_field?: boolean
          has_foreign_teachers?: boolean
          has_gym?: boolean
          has_international_accreditation?: boolean
          has_library?: boolean
          has_meals?: boolean
          has_medical_room?: boolean
          has_psychologist?: boolean
          has_saturday_classes?: boolean
          has_science_labs?: boolean
          has_security_24_7?: boolean
          has_sibling_discount?: boolean
          has_swimming_pool?: boolean
          has_transport?: boolean
          id?: string
          lesson_duration?: number | null
          lessons_per_day?: number | null
          license_authority?: string | null
          license_date?: string | null
          license_number?: string | null
          license_valid_until?: string | null
          meal_fee_monthly?: number | null
          native_english_speakers_count?: number | null
          organization_id: string
          primary_language?: string
          school_area_sqm?: number | null
          school_end_time?: string | null
          school_start_time?: string | null
          school_type: string
          sibling_discount_percent?: number | null
          sports_sections?: string[] | null
          teachers_with_higher_ed_percent?: number | null
          textbook_fee_yearly?: number | null
          total_students?: number | null
          total_teachers?: number | null
          transport_fee_monthly?: number | null
          uniform_fee?: number | null
          updated_at?: string
        }
        Update: {
          accepted_grades?: number[] | null
          accepts_preparatory?: boolean
          accreditation_body?: string | null
          additional_languages?: string[] | null
          avg_class_size?: number | null
          avg_teacher_experience_years?: number | null
          classrooms_count?: number | null
          clubs?: string[] | null
          created_at?: string
          curriculum?: string[] | null
          entrance_fee?: number | null
          extended_day_until?: string | null
          extracurricular_activities?: string[] | null
          fee_monthly_max?: number | null
          fee_monthly_min?: number | null
          grade_from?: number
          grade_to?: number
          pricing_tiers?: Json | null
          has_cafeteria?: boolean
          has_cctv?: boolean
          has_computer_lab?: boolean
          has_extended_day?: boolean
          has_football_field?: boolean
          has_foreign_teachers?: boolean
          has_gym?: boolean
          has_international_accreditation?: boolean
          has_library?: boolean
          has_meals?: boolean
          has_medical_room?: boolean
          has_psychologist?: boolean
          has_saturday_classes?: boolean
          has_science_labs?: boolean
          has_security_24_7?: boolean
          has_sibling_discount?: boolean
          has_swimming_pool?: boolean
          has_transport?: boolean
          id?: string
          lesson_duration?: number | null
          lessons_per_day?: number | null
          license_authority?: string | null
          license_date?: string | null
          license_number?: string | null
          license_valid_until?: string | null
          meal_fee_monthly?: number | null
          native_english_speakers_count?: number | null
          organization_id?: string
          primary_language?: string
          school_area_sqm?: number | null
          school_end_time?: string | null
          school_start_time?: string | null
          school_type?: string
          sibling_discount_percent?: number | null
          sports_sections?: string[] | null
          teachers_with_higher_ed_percent?: number | null
          textbook_fee_yearly?: number | null
          total_students?: number | null
          total_teachers?: number | null
          transport_fee_monthly?: number | null
          uniform_fee?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_details_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          website: string | null
          founder: string | null
          description: string | null
          founded_year: number | null
          phone: string | null
          email: string | null
          instagram: string | null
          facebook: string | null
          youtube: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          website?: string | null
          founder?: string | null
          description?: string | null
          detailed_description?: string | null
          founded_year?: number | null
          phone?: string | null
          email?: string | null
          instagram?: string | null
          facebook?: string | null
          youtube?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          website?: string | null
          founder?: string | null
          description?: string | null
          detailed_description?: string | null
          founded_year?: number | null
          phone?: string | null
          email?: string | null
          instagram?: string | null
          facebook?: string | null
          youtube?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_reviews: {
        Row: {
          id: string
          organization_id: string
          author_name: string
          author_role: string
          author_avatar_url: string | null
          is_verified_parent: boolean
          rating: number
          ratings: Json | null
          content: string
          pros: string[] | null
          cons: string[] | null
          helpful_count: number
          school_response: string | null
          school_response_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          author_name: string
          author_role: string
          author_avatar_url?: string | null
          is_verified_parent?: boolean
          rating: number
          ratings?: Json | null
          content: string
          pros?: string[] | null
          cons?: string[] | null
          helpful_count?: number
          school_response?: string | null
          school_response_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          author_name?: string
          author_role?: string
          author_avatar_url?: string | null
          is_verified_parent?: boolean
          rating?: number
          ratings?: Json | null
          content?: string
          pros?: string[] | null
          cons?: string[] | null
          helpful_count?: number
          school_response?: string | null
          school_response_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_media: {
        Row: {
          id: string
          organization_id: string
          type: string
          url: string
          category: string | null
          caption: string | null
          is_cover: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          type: string
          url: string
          category?: string | null
          caption?: string | null
          is_cover?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          type?: string
          url?: string
          category?: string | null
          caption?: string | null
          is_cover?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_media_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_staff: {
        Row: {
          id: string
          organization_id: string
          name: string
          position: string
          photo_url: string | null
          experience_years: number | null
          education: string | null
          certifications: string[] | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          position: string
          photo_url?: string | null
          experience_years?: number | null
          education?: string | null
          certifications?: string[] | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          position?: string
          photo_url?: string | null
          experience_years?: number | null
          education?: string | null
          certifications?: string[] | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_staff_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      school_results: {
        Row: {
          id: string
          organization_id: string
          year: number
          total_graduates: number | null
          graduates_to_universities: number | null
          graduates_on_grants: number | null
          graduates_to_top_uz_universities: number | null
          graduates_to_foreign_universities: number | null
          top_universities_uz: string[] | null
          foreign_universities: string[] | null
          avg_dtm_score: number | null
          avg_ielts_score: number | null
          avg_sat_score: number | null
          students_with_ielts_7plus: number | null
          students_with_ielts_8plus: number | null
          olympiad_medals_international: number
          olympiad_medals_national: number
          olympiad_medals_city: number
          olympiad_subjects: string[] | null
          school_awards: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          year: number
          total_graduates?: number | null
          graduates_to_universities?: number | null
          graduates_on_grants?: number | null
          graduates_to_top_uz_universities?: number | null
          graduates_to_foreign_universities?: number | null
          top_universities_uz?: string[] | null
          foreign_universities?: string[] | null
          avg_dtm_score?: number | null
          avg_ielts_score?: number | null
          avg_sat_score?: number | null
          students_with_ielts_7plus?: number | null
          students_with_ielts_8plus?: number | null
          olympiad_medals_international?: number
          olympiad_medals_national?: number
          olympiad_medals_city?: number
          olympiad_subjects?: string[] | null
          school_awards?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          year?: number
          total_graduates?: number | null
          graduates_to_universities?: number | null
          graduates_on_grants?: number | null
          graduates_to_top_uz_universities?: number | null
          graduates_to_foreign_universities?: number | null
          top_universities_uz?: string[] | null
          foreign_universities?: string[] | null
          avg_dtm_score?: number | null
          avg_ielts_score?: number | null
          avg_sat_score?: number | null
          students_with_ielts_7plus?: number | null
          students_with_ielts_8plus?: number | null
          olympiad_medals_international?: number
          olympiad_medals_national?: number
          olympiad_medals_city?: number
          olympiad_subjects?: string[] | null
          school_awards?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          email_verified: boolean
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          organization_id: string | null
          role: string
          subscription_expires_at: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          email_verified?: boolean
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          organization_id?: string | null
          role?: string
          subscription_expires_at?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          organization_id?: string | null
          role?: string
          subscription_expires_at?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          id: number
          name_uz: string
          name_ru: string | null
          name_oz: string | null
          soato_code: string | null
          region_type: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name_uz: string
          name_ru?: string | null
          name_oz?: string | null
          soato_code?: string | null
          region_type?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name_uz?: string
          name_ru?: string | null
          name_oz?: string | null
          soato_code?: string | null
          region_type?: string | null
          created_at?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          id: number
          region_id: number
          name_uz: string
          name_ru: string | null
          name_oz: string | null
          soato_code: string | null
          district_type: string | null
          created_at: string
        }
        Insert: {
          id?: number
          region_id: number
          name_uz: string
          name_ru?: string | null
          name_oz?: string | null
          soato_code?: string | null
          district_type?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          region_id?: number
          name_uz?: string
          name_ru?: string | null
          name_oz?: string | null
          soato_code?: string | null
          district_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      school_sections_progress: {
        Row: {
          id: string
          organization_id: string
          basic: number
          education: number
          teachers: number
          infrastructure: number
          services: number
          results: number
          admission: number
          finance: number
          documents: number
          photos: number
          videos: number
          overall: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          basic?: number
          education?: number
          teachers?: number
          infrastructure?: number
          services?: number
          results?: number
          admission?: number
          finance?: number
          documents?: number
          photos?: number
          videos?: number
          overall?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          basic?: number
          education?: number
          teachers?: number
          infrastructure?: number
          services?: number
          results?: number
          admission?: number
          finance?: number
          documents?: number
          photos?: number
          videos?: number
          overall?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_sections_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
