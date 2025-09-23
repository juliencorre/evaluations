export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ResultType = 'scale' | 'boolean' | 'custom' | 'numeric'

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          first_name: string
          last_name: string
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          display_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      competency_frameworks: {
        Row: {
          id: string
          name: string
          version: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          version?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      domains: {
        Row: {
          id: string
          framework_id: string
          name: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          framework_id: string
          name: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          framework_id?: string
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      fields: {
        Row: {
          id: string
          domain_id: string
          name: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          domain_id: string
          name: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          domain_id?: string
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      competencies: {
        Row: {
          id: string
          field_id: string
          name: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          field_id: string
          name: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          field_id?: string
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      specific_competencies: {
        Row: {
          id: string
          competency_id: string
          name: string
          description: string | null
          order_index: number
          result_type_config_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competency_id: string
          name: string
          description?: string | null
          order_index?: number
          result_type_config_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competency_id?: string
          name?: string
          description?: string | null
          order_index?: number
          result_type_config_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          name: string
          description: string | null
          framework_id: string
          class_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          framework_id: string
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          framework_id?: string
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      evaluation_results: {
        Row: {
          id: string
          evaluation_id: string
          student_id: string
          specific_competency_id: string
          value: string
          comment: string | null
          evaluated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evaluation_id: string
          student_id: string
          specific_competency_id: string
          value: string
          comment?: string | null
          evaluated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evaluation_id?: string
          student_id?: string
          specific_competency_id?: string
          value?: 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A'
          comment?: string | null
          evaluated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      result_type_configs: {
        Row: {
          id: string
          name: string
          type: ResultType
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: ResultType
          config: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: ResultType
          config?: Json
          created_at?: string
          updated_at?: string
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
      result_type: ResultType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}