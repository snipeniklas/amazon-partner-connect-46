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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      contact_comments: {
        Row: {
          comment_text: string
          contact_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          contact_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          contact_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_comments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          additional_comments: string | null
          amazon_experience: boolean | null
          amazon_work_capacity: string | null
          bicycle_count: number | null
          bicycle_driver_count: number | null
          cargo_bike_count: number | null
          city_availability: Json | null
          company_address: string | null
          company_established_year: number | null
          company_name: string
          company_owns_vehicles: boolean | null
          contact_person_first_name: string | null
          contact_person_last_name: string | null
          contact_person_position: string | null
          created_at: string
          delivery_driver_count: number | null
          email_address: string
          email_sent: boolean | null
          email_sent_at: string | null
          employee_type: string | null
          employment_status: string | null
          food_delivery_platforms: string[] | null
          food_delivery_services: boolean | null
          form_completed: boolean | null
          form_completed_at: string | null
          form_config: Json | null
          full_time_drivers: number | null
          gig_economy_companies: string[] | null
          gig_economy_other: string | null
          id: string
          is_last_mile_logistics: boolean | null
          last_mile_since_when: string | null
          legal_form: string | null
          market_type: string | null
          operates_last_mile_logistics: boolean | null
          operates_multiple_cities: boolean | null
          operates_multiple_countries: boolean | null
          operating_cities: string[] | null
          phone_number: string | null
          quick_commerce_companies: string[] | null
          quick_commerce_other: string | null
          resend_email_id: string | null
          staff_types: string[] | null
          target_market: string | null
          total_vehicle_count: number | null
          transporter_count: number | null
          updated_at: string
          user_id: string
          uses_cargo_bikes: boolean | null
          vehicle_types: string[] | null
          website: string | null
          works_for_gig_economy_food: boolean | null
          works_for_quick_commerce: boolean | null
        }
        Insert: {
          additional_comments?: string | null
          amazon_experience?: boolean | null
          amazon_work_capacity?: string | null
          bicycle_count?: number | null
          bicycle_driver_count?: number | null
          cargo_bike_count?: number | null
          city_availability?: Json | null
          company_address?: string | null
          company_established_year?: number | null
          company_name: string
          company_owns_vehicles?: boolean | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          contact_person_position?: string | null
          created_at?: string
          delivery_driver_count?: number | null
          email_address: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_type?: string | null
          employment_status?: string | null
          food_delivery_platforms?: string[] | null
          food_delivery_services?: boolean | null
          form_completed?: boolean | null
          form_completed_at?: string | null
          form_config?: Json | null
          full_time_drivers?: number | null
          gig_economy_companies?: string[] | null
          gig_economy_other?: string | null
          id?: string
          is_last_mile_logistics?: boolean | null
          last_mile_since_when?: string | null
          legal_form?: string | null
          market_type?: string | null
          operates_last_mile_logistics?: boolean | null
          operates_multiple_cities?: boolean | null
          operates_multiple_countries?: boolean | null
          operating_cities?: string[] | null
          phone_number?: string | null
          quick_commerce_companies?: string[] | null
          quick_commerce_other?: string | null
          resend_email_id?: string | null
          staff_types?: string[] | null
          target_market?: string | null
          total_vehicle_count?: number | null
          transporter_count?: number | null
          updated_at?: string
          user_id: string
          uses_cargo_bikes?: boolean | null
          vehicle_types?: string[] | null
          website?: string | null
          works_for_gig_economy_food?: boolean | null
          works_for_quick_commerce?: boolean | null
        }
        Update: {
          additional_comments?: string | null
          amazon_experience?: boolean | null
          amazon_work_capacity?: string | null
          bicycle_count?: number | null
          bicycle_driver_count?: number | null
          cargo_bike_count?: number | null
          city_availability?: Json | null
          company_address?: string | null
          company_established_year?: number | null
          company_name?: string
          company_owns_vehicles?: boolean | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          contact_person_position?: string | null
          created_at?: string
          delivery_driver_count?: number | null
          email_address?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_type?: string | null
          employment_status?: string | null
          food_delivery_platforms?: string[] | null
          food_delivery_services?: boolean | null
          form_completed?: boolean | null
          form_completed_at?: string | null
          form_config?: Json | null
          full_time_drivers?: number | null
          gig_economy_companies?: string[] | null
          gig_economy_other?: string | null
          id?: string
          is_last_mile_logistics?: boolean | null
          last_mile_since_when?: string | null
          legal_form?: string | null
          market_type?: string | null
          operates_last_mile_logistics?: boolean | null
          operates_multiple_cities?: boolean | null
          operates_multiple_countries?: boolean | null
          operating_cities?: string[] | null
          phone_number?: string | null
          quick_commerce_companies?: string[] | null
          quick_commerce_other?: string | null
          resend_email_id?: string | null
          staff_types?: string[] | null
          target_market?: string | null
          total_vehicle_count?: number | null
          transporter_count?: number | null
          updated_at?: string
          user_id?: string
          uses_cargo_bikes?: boolean | null
          vehicle_types?: string[] | null
          website?: string | null
          works_for_gig_economy_food?: boolean | null
          works_for_quick_commerce?: boolean | null
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          contact_id: string
          created_at: string
          email_id: string
          event_data: Json | null
          event_type: string
          id: string
          market_type: string | null
          target_market: string | null
          timestamp: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          email_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          market_type?: string | null
          target_market?: string | null
          timestamp?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          email_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          market_type?: string | null
          target_market?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          allowed_market_types: string[] | null
          allowed_markets: string[] | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_market_types?: string[] | null
          allowed_markets?: string[] | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_market_types?: string[] | null
          allowed_markets?: string[] | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: {
          allowed_market_types: string[]
          allowed_markets: string[]
          is_admin: boolean
        }[]
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
