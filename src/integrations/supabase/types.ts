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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      item_qr_links: {
        Row: {
          assigned_at: string | null
          id: string
          item_id: string
          qr_key: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          item_id: string
          qr_key: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          item_id?: string
          qr_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_qr_links_qr_key_fkey"
            columns: ["qr_key"]
            isOneToOne: false
            referencedRelation: "qr_catalog"
            referencedColumns: ["qr_key"]
          },
        ]
      }
      items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          documents: Json | null
          icon_id: string | null
          id: string
          name: string
          notes: string | null
          photo_url: string | null
          purchase_date: string | null
          qr_code_id: string | null
          room: string | null
          updated_at: string
          user_id: string
          warranty_date: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          documents?: Json | null
          icon_id?: string | null
          id?: string
          name: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          qr_code_id?: string | null
          room?: string | null
          updated_at?: string
          user_id: string
          warranty_date?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          documents?: Json | null
          icon_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          qr_code_id?: string | null
          room?: string | null
          updated_at?: string
          user_id?: string
          warranty_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          created_at: string
          date: string
          id: string
          item_id: string | null
          notes: string | null
          parent_task_id: string | null
          recurrence: string
          recurrence_rule: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          item_id?: string | null
          notes?: string | null
          parent_task_id?: string | null
          recurrence?: string
          recurrence_rule?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          item_id?: string | null
          notes?: string | null
          parent_task_id?: string | null
          recurrence?: string
          recurrence_rule?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          message: string | null
          read: boolean
          task_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          message?: string | null
          read?: boolean
          task_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          message?: string | null
          read?: boolean
          task_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          qr_tokens: Json | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          qr_tokens?: Json | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          qr_tokens?: Json | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string | null
          fulfillment_error: string | null
          id: string
          printful_error: string | null
          printful_order_id: string | null
          printful_status: string | null
          retry_count: number | null
          shipping_phone: string | null
          status: string
          stripe_session_id: string | null
          total_amount: number
          updated_at: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          fulfillment_error?: string | null
          id?: string
          printful_error?: string | null
          printful_order_id?: string | null
          printful_status?: string | null
          retry_count?: number | null
          shipping_phone?: string | null
          status?: string
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          fulfillment_error?: string | null
          id?: string
          printful_error?: string | null
          printful_order_id?: string | null
          printful_status?: string | null
          retry_count?: number | null
          shipping_phone?: string | null
          status?: string
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      printable_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_url: string
          id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_url: string
          id?: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          printful_product_id: string | null
          printful_variant_id: string | null
          template_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          printful_product_id?: string | null
          printful_variant_id?: string | null
          template_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          printful_product_id?: string | null
          printful_variant_id?: string | null
          template_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qr_catalog: {
        Row: {
          created_at: string | null
          is_active: boolean | null
          metadata: Json | null
          qr_key: string
        }
        Insert: {
          created_at?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          qr_key: string
        }
        Update: {
          created_at?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          qr_key?: string
        }
        Relationships: []
      }
      qr_code_packs: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          physical_product_info: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          physical_product_info?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          physical_product_info?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          claimed_at: string | null
          claimed_by_user_id: string | null
          claimed_item_id: string | null
          code: string
          code_printed: string
          created_at: string
          id: string
          image_url: string | null
          pack_id: string | null
          qr_key_canonical: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          claimed_item_id?: string | null
          code: string
          code_printed: string
          created_at?: string
          id?: string
          image_url?: string | null
          pack_id?: string | null
          qr_key_canonical: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          claimed_item_id?: string | null
          code?: string
          code_printed?: string
          created_at?: string
          id?: string
          image_url?: string | null
          pack_id?: string | null
          qr_key_canonical?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_claimed_item_id_fkey"
            columns: ["claimed_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "qr_code_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "qr_pack_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_scans: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          qr_key: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          qr_key: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          qr_key?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          id: string
          qr_code_id: string
          scanned_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          qr_code_id: string
          scanned_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          qr_code_id?: string
          scanned_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_history_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shipping_addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          line1: string
          line2: string | null
          name: string
          order_id: string | null
          postal_code: string
          state: string | null
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          line1: string
          line2?: string | null
          name: string
          order_id?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          line1?: string
          line2?: string | null
          name?: string
          order_id?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json | null
          id: string
          interval_type: string
          is_active: boolean | null
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          interval_type?: string
          is_active?: boolean | null
          name: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json | null
          id?: string
          interval_type?: string
          is_active?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_qr_claims: {
        Row: {
          claimed_at: string
          id: string
          item_id: string
          qr_code_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          item_id: string
          qr_code_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          item_id?: string
          qr_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_qr_claims_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_qr_claims_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_qr_links: {
        Row: {
          assigned_at: string
          id: string
          item_id: string
          qr_code_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          item_id: string
          qr_code_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          item_id?: string
          qr_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_qr_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_qr_links_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          calendar_default_view: string | null
          created_at: string | null
          date_format: string | null
          id: string
          language: string | null
          notification_recurring_task_reminder: boolean | null
          notification_task_completed: boolean | null
          notification_task_created: boolean | null
          notification_task_due_soon: boolean | null
          notification_task_due_today: boolean | null
          notification_task_overdue: boolean | null
          notification_task_updated: boolean | null
          notification_warranty_expiring: boolean | null
          qr_scan_sound: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendar_default_view?: string | null
          created_at?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          notification_recurring_task_reminder?: boolean | null
          notification_task_completed?: boolean | null
          notification_task_created?: boolean | null
          notification_task_due_soon?: boolean | null
          notification_task_due_today?: boolean | null
          notification_task_overdue?: boolean | null
          notification_task_updated?: boolean | null
          notification_warranty_expiring?: boolean | null
          qr_scan_sound?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendar_default_view?: string | null
          created_at?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          notification_recurring_task_reminder?: boolean | null
          notification_task_completed?: boolean | null
          notification_task_created?: boolean | null
          notification_task_due_soon?: boolean | null
          notification_task_due_today?: boolean | null
          notification_task_overdue?: boolean | null
          notification_task_updated?: boolean | null
          notification_warranty_expiring?: boolean | null
          qr_scan_sound?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          native_transaction_id: string | null
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          native_transaction_id?: string | null
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          native_transaction_id?: string | null
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_data: Json | null
          id: string
          processing_status: string | null
          stripe_session_id: string | null
          webhook_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          id?: string
          processing_status?: string | null
          stripe_session_id?: string | null
          webhook_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          id?: string
          processing_status?: string | null
          stripe_session_id?: string | null
          webhook_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      qr_pack_stats: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          physical_product_info: string | null
          qr_code_count: number | null
          recent_codes: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_qr_code: {
        Args: { qr_code_uuid: string }
        Returns: boolean
      }
      check_qr_assignment: {
        Args: { p_qr_key: string }
        Returns: Json
      }
      check_qr_assignment_v2: {
        Args: { p_qr_key: string }
        Returns: Json
      }
      claim_qr: {
        Args: { p_code: string; p_item_id: string; p_user_id: string }
        Returns: Json
      }
      claim_qr_for_item: {
        Args: { p_item_id: string; p_qr_key: string }
        Returns: Json
      }
      claim_qr_for_item_v2: {
        Args: { p_item_id: string; p_qr_key: string }
        Returns: Json
      }
      create_item_and_claim_qr: {
        Args: {
          p_category?: string
          p_description?: string
          p_icon_id?: string
          p_name: string
          p_notes?: string
          p_photo_url?: string
          p_qr_key: string
          p_room?: string
        }
        Returns: string
      }
      create_item_and_claim_qr_v2: {
        Args: {
          p_category?: string
          p_description?: string
          p_icon_id?: string
          p_name: string
          p_notes?: string
          p_photo_url?: string
          p_qr_key: string
          p_room?: string
        }
        Returns: string
      }
      get_user_subscription: {
        Args: { user_uuid: string }
        Returns: {
          current_period_end: string
          features: Json
          plan_name: string
          status: string
        }[]
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      unassign_qr: {
        Args: { p_qr_key: string }
        Returns: Json
      }
      unassign_qr_v2: {
        Args: { p_qr_key: string }
        Returns: Json
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
