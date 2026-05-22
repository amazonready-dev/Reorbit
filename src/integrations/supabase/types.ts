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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      billing_charges: {
        Row: {
          activated_at: string | null
          cancelled_at: string | null
          confirmation_url: string | null
          created_at: string
          currency: string
          id: string
          interval: string
          plan_name: string
          price: number
          shop_domain: string
          shop_id: string | null
          shopify_charge_id: string
          status: string
          test: boolean
          trial_days: number
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          cancelled_at?: string | null
          confirmation_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          interval?: string
          plan_name: string
          price: number
          shop_domain: string
          shop_id?: string | null
          shopify_charge_id: string
          status?: string
          test?: boolean
          trial_days?: number
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          cancelled_at?: string | null
          confirmation_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          interval?: string
          plan_name?: string
          price?: number
          shop_domain?: string
          shop_id?: string | null
          shopify_charge_id?: string
          status?: string
          test?: boolean
          trial_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_charges_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          sources: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          sources?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          sources?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          currency: string | null
          customer_id: string | null
          email: string | null
          financial_status: string | null
          fulfillment_status: string | null
          id: string
          line_items: Json | null
          order_number: string | null
          processed_at: string | null
          processing_error: string | null
          processing_status: string
          raw: Json
          received_at: string
          shop_domain: string
          shop_id: string | null
          shopify_created_at: string | null
          shopify_order_id: string
          total_price: number | null
        }
        Insert: {
          currency?: string | null
          customer_id?: string | null
          email?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items?: Json | null
          order_number?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          raw: Json
          received_at?: string
          shop_domain: string
          shop_id?: string | null
          shopify_created_at?: string | null
          shopify_order_id: string
          total_price?: number | null
        }
        Update: {
          currency?: string | null
          customer_id?: string | null
          email?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items?: Json | null
          order_number?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          raw?: Json
          received_at?: string
          shop_domain?: string
          shop_id?: string | null
          shopify_created_at?: string | null
          shopify_order_id?: string
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_oauth_states: {
        Row: {
          created_at: string
          shop_domain: string
          state: string
        }
        Insert: {
          created_at?: string
          shop_domain: string
          state: string
        }
        Update: {
          created_at?: string
          shop_domain?: string
          state?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          access_token: string
          currency: string | null
          id: string
          installed_at: string
          plan_name: string | null
          scope: string
          shop_domain: string
          shop_email: string | null
          shop_name: string | null
          uninstalled_at: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          currency?: string | null
          id?: string
          installed_at?: string
          plan_name?: string | null
          scope: string
          shop_domain: string
          shop_email?: string | null
          shop_name?: string | null
          uninstalled_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          currency?: string | null
          id?: string
          installed_at?: string
          plan_name?: string | null
          scope?: string
          shop_domain?: string
          shop_email?: string | null
          shop_name?: string | null
          uninstalled_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      upsell_offers: {
        Row: {
          completion_tokens: number | null
          created_at: string
          delivery_error: string | null
          delivery_status: string
          email_body_html: string | null
          email_body_text: string | null
          email_preheader: string | null
          email_subject: string | null
          id: string
          model: string | null
          order_id: string
          prompt_tokens: number | null
          reasoning: string | null
          recipient_email: string | null
          recommended_products: Json | null
          scheduled_for: string | null
          sent_at: string | null
          shop_domain: string
          shop_id: string | null
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string
          delivery_error?: string | null
          delivery_status?: string
          email_body_html?: string | null
          email_body_text?: string | null
          email_preheader?: string | null
          email_subject?: string | null
          id?: string
          model?: string | null
          order_id: string
          prompt_tokens?: number | null
          reasoning?: string | null
          recipient_email?: string | null
          recommended_products?: Json | null
          scheduled_for?: string | null
          sent_at?: string | null
          shop_domain: string
          shop_id?: string | null
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string
          delivery_error?: string | null
          delivery_status?: string
          email_body_html?: string | null
          email_body_text?: string | null
          email_preheader?: string | null
          email_subject?: string | null
          id?: string
          model?: string | null
          order_id?: string
          prompt_tokens?: number | null
          reasoning?: string | null
          recipient_email?: string | null
          recommended_products?: Json | null
          scheduled_for?: string | null
          sent_at?: string | null
          shop_domain?: string
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upsell_offers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_offers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          monthly_orders: string | null
          referrer: string | null
          shopify_store: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          monthly_orders?: string | null
          referrer?: string | null
          shopify_store?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          monthly_orders?: string | null
          referrer?: string | null
          shopify_store?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          error: string | null
          id: string
          payload: Json
          processed_at: string | null
          received_at: string
          shop_domain: string
          shopify_webhook_id: string | null
          status: string
          topic: string
        }
        Insert: {
          error?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          received_at?: string
          shop_domain: string
          shopify_webhook_id?: string | null
          status?: string
          topic: string
        }
        Update: {
          error?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          shop_domain?: string
          shopify_webhook_id?: string | null
          status?: string
          topic?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      match_knowledge: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
