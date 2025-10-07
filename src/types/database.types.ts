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
      classes: {
        Row: {
          id: string
          name: string
          description: string | null
          school_year: string
          level: string | null
          subject: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          school_year?: string
          level?: string | null
          subject?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          school_year?: string
          level?: string | null
          subject?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      competencies: {
        Row: {
          created_at: string | null
          description: string | null
          field_id: string
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          field_id: string
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          field_id?: string
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competencies_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_frameworks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      domains: {
        Row: {
          created_at: string | null
          description: string | null
          framework_id: string
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          framework_id: string
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          framework_id?: string
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "competency_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_results: {
        Row: {
          comment: string | null
          created_at: string | null
          evaluated_at: string | null
          evaluation_id: string
          id: string
          specific_competency_id: string
          student_id: string
          updated_at: string | null
          value: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          evaluated_at?: string | null
          evaluation_id: string
          id?: string
          specific_competency_id: string
          student_id: string
          updated_at?: string | null
          value: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          evaluated_at?: string | null
          evaluation_id?: string
          id?: string
          specific_competency_id?: string
          student_id?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_results_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_results_specific_competency_id_fkey"
            columns: ["specific_competency_id"]
            isOneToOne: false
            referencedRelation: "specific_competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          class_id: string | null
          created_at: string | null
          description: string | null
          framework_id: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          framework_id: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          framework_id?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "competency_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          created_at: string | null
          description: string | null
          domain_id: string
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain_id: string
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain_id?: string
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fields_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      school_years: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          id: string
          student_id: string
          class_id: string
          school_year_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          school_year_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          school_year_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_restrictions: {
        Row: {
          id: string
          rule_type: 'email' | 'domain'
          value: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rule_type: 'email' | 'domain'
          value: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rule_type?: 'email' | 'domain'
          value?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      result_type_configs: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["result_type"]
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["result_type"]
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["result_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      specific_competencies: {
        Row: {
          competency_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          result_type_config_id: string
          updated_at: string | null
        }
        Insert: {
          competency_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          result_type_config_id: string
          updated_at?: string | null
        }
        Update: {
          competency_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          result_type_config_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specific_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specific_competencies_result_type_config_id_fkey"
            columns: ["result_type_config_id"]
            isOneToOne: false
            referencedRelation: "result_type_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          display_name: string
          gender: 'M' | 'F' | 'Autre' | null
          birth_date: string | null
          class_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          display_name: string
          gender?: 'M' | 'F' | 'Autre' | null
          birth_date?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          display_name?: string
          gender?: 'M' | 'F' | 'Autre' | null
          birth_date?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_classes: {
        Row: {
          id: string
          user_id: string
          class_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          class_id?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_email_registration: {
        Args: {
          email_to_validate: string
        }
        Returns: {
          allowed: boolean
          message: string
        }
      }
      get_searchable_classes: {
        Args: Record<string, never>
        Returns: {
          id: string
          name: string
          description: string | null
          school_year: string
          level: string | null
          subject: string | null
          active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_class_members: {
        Args: {
          p_class_id: string
        }
        Returns: {
          id: string
          class_id: string
          user_id: string
          role: 'teacher' | 'owner' | 'assistant'
          email: string
          full_name: string
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      result_type: "scale" | "boolean" | "custom" | "numeric"
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
    Enums: {
      result_type: ["scale", "boolean", "custom", "numeric"],
    },
  },
} as const