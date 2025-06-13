export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          admin_id: string
          created_at: string | null
          gym_id: string | null
          number: string | null
        }
        Insert: {
          admin_id?: string
          created_at?: string | null
          gym_id?: string | null
          number?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          gym_id?: string | null
          number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["gym_id"]
          },
        ]
      }
      broadcast_queue: {
        Row: {
          broadcast_id: string
          created_at: string | null
          gym_id: string | null
          message: string | null
          sent: boolean | null
          target: string | null
        }
        Insert: {
          broadcast_id?: string
          created_at?: string | null
          gym_id?: string | null
          message?: string | null
          sent?: boolean | null
          target?: string | null
        }
        Update: {
          broadcast_id?: string
          created_at?: string | null
          gym_id?: string | null
          message?: string | null
          sent?: boolean | null
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_queue_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["gym_id"]
          },
        ]
      }
      gyms: {
        Row: {
          activated: boolean | null
          address: string | null
          class_schedule: string | null
          created_at: string | null
          gym_id: string
          membership_plans: string | null
          name: string | null
          offers: string | null
          owner_name: string | null
          phone_number: string | null
          whatsapp_connected_at: string | null
          whatsapp_qr_code: string | null
          whatsapp_status: string | null
        }
        Insert: {
          activated?: boolean | null
          address?: string | null
          class_schedule?: string | null
          created_at?: string | null
          gym_id?: string
          membership_plans?: string | null
          name?: string | null
          offers?: string | null
          owner_name?: string | null
          phone_number?: string | null
          whatsapp_connected_at?: string | null
          whatsapp_qr_code?: string | null
          whatsapp_status?: string | null
        }
        Update: {
          activated?: boolean | null
          address?: string | null
          class_schedule?: string | null
          created_at?: string | null
          gym_id?: string
          membership_plans?: string | null
          name?: string | null
          offers?: string | null
          owner_name?: string | null
          phone_number?: string | null
          whatsapp_connected_at?: string | null
          whatsapp_qr_code?: string | null
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          goal: string | null
          gym_id: string | null
          lead_id: string
          message: string | null
          name: string | null
          number: string | null
        }
        Insert: {
          created_at?: string | null
          goal?: string | null
          gym_id?: string | null
          lead_id?: string
          message?: string | null
          name?: string | null
          number?: string | null
        }
        Update: {
          created_at?: string | null
          goal?: string | null
          gym_id?: string | null
          lead_id?: string
          message?: string | null
          name?: string | null
          number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["gym_id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          goal: string | null
          gym_id: string | null
          join_date: string | null
          member_id: string
          monthly_goal: number | null
          name: string | null
          next_payment_date: string | null
          number: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          goal?: string | null
          gym_id?: string | null
          join_date?: string | null
          member_id?: string
          monthly_goal?: number | null
          name?: string | null
          next_payment_date?: string | null
          number?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          goal?: string | null
          gym_id?: string | null
          join_date?: string | null
          member_id?: string
          monthly_goal?: number | null
          name?: string | null
          next_payment_date?: string | null
          number?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["gym_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          gym_id: string | null
          member_id: string | null
          next_due: string | null
          paid_on: string | null
          payment_id: string
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          gym_id?: string | null
          member_id?: string | null
          next_due?: string | null
          paid_on?: string | null
          payment_id?: string
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          gym_id?: string | null
          member_id?: string | null
          next_due?: string | null
          paid_on?: string | null
          payment_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["gym_id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string | null
          date: string | null
          duration: number | null
          gym_id: string | null
          member_id: string | null
          notes: string | null
          type: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          duration?: number | null
          gym_id?: string | null
          member_id?: string | null
          notes?: string | null
          type?: string | null
          workout_id?: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          duration?: number | null
          gym_id?: string | null
          member_id?: string | null
          notes?: string | null
          type?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["gym_id"]
          },
          {
            foreignKeyName: "workouts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["member_id"]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
