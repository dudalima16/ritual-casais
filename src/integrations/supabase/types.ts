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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          edited_after_close: boolean
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          edited_after_close?: boolean
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          edited_after_close?: boolean
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          bank_name: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          bank_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          bank_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          budget_month_id: string
          category_id: string
          created_at: string
          id: string
          planned_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_month_id: string
          category_id: string
          created_at?: string
          id?: string
          planned_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_month_id?: string
          category_id?: string
          created_at?: string
          id?: string
          planned_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_budget_month_id_fkey"
            columns: ["budget_month_id"]
            isOneToOne: false
            referencedRelation: "budget_months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_months: {
        Row: {
          cloned_from: string | null
          closed_at: string | null
          created_at: string
          id: string
          month: number
          status: Database["public"]["Enums"]["budget_status"]
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          cloned_from?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          month: number
          status?: Database["public"]["Enums"]["budget_status"]
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          cloned_from?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          month?: number
          status?: Database["public"]["Enums"]["budget_status"]
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_months_cloned_from_fkey"
            columns: ["cloned_from"]
            isOneToOne: false
            referencedRelation: "budget_months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_months_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          budget_limit: number
          created_at: string
          id: string
          is_active: boolean
          last_four: string | null
          name: string
          total_limit: number
          user_id: string
        }
        Insert: {
          budget_limit?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_four?: string | null
          name: string
          total_limit?: number
          user_id: string
        }
        Update: {
          budget_limit?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_four?: string | null
          name?: string
          total_limit?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_expenses: {
        Row: {
          amount: number
          budget_month_id: string
          created_at: string
          due_day: number | null
          id: string
          is_paid: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          budget_month_id: string
          created_at?: string
          due_day?: number | null
          id?: string
          is_paid?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_month_id?: string
          created_at?: string
          due_day?: number | null
          id?: string
          is_paid?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_expenses_budget_month_id_fkey"
            columns: ["budget_month_id"]
            isOneToOne: false
            referencedRelation: "budget_months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          created_at: string
          error_message: string | null
          file_hash: string
          file_name: string
          id: string
          source_type: Database["public"]["Enums"]["import_source"]
          status: Database["public"]["Enums"]["import_status"]
          transaction_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_hash: string
          file_name: string
          id?: string
          source_type: Database["public"]["Enums"]["import_source"]
          status?: Database["public"]["Enums"]["import_status"]
          transaction_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_hash?: string
          file_name?: string
          id?: string
          source_type?: Database["public"]["Enums"]["import_source"]
          status?: Database["public"]["Enums"]["import_status"]
          transaction_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          partner_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          partner_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          partner_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          budget_month_id: string | null
          category_id: string | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          external_id: string | null
          id: string
          import_batch_id: string | null
          is_internal: boolean
          merchant: string
          needs_review: boolean
          reviewed_at: string | null
          source: Database["public"]["Enums"]["import_source"]
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          budget_month_id?: string | null
          category_id?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          external_id?: string | null
          id?: string
          import_batch_id?: string | null
          is_internal?: boolean
          merchant: string
          needs_review?: boolean
          reviewed_at?: string | null
          source?: Database["public"]["Enums"]["import_source"]
          transaction_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_month_id?: string | null
          category_id?: string | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          external_id?: string | null
          id?: string
          import_batch_id?: string | null
          is_internal?: boolean
          merchant?: string
          needs_review?: boolean
          reviewed_at?: string | null
          source?: Database["public"]["Enums"]["import_source"]
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_budget_month_id_fkey"
            columns: ["budget_month_id"]
            isOneToOne: false
            referencedRelation: "budget_months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clone_previous_month: {
        Args: { _month: number; _user_id: string; _year: number }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      audit_action: "create" | "update" | "delete"
      budget_status: "draft" | "closed"
      confidence_level: "high" | "medium" | "low"
      import_source: "ofx" | "print" | "manual"
      import_status: "processing" | "completed" | "failed"
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
      app_role: ["admin", "user"],
      audit_action: ["create", "update", "delete"],
      budget_status: ["draft", "closed"],
      confidence_level: ["high", "medium", "low"],
      import_source: ["ofx", "print", "manual"],
      import_status: ["processing", "completed", "failed"],
    },
  },
} as const
