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
      categories: {
        Row: {
          id: string
          created_at: string | null
          name: string
          user_id: string
          usage_count: number | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          user_id: string
          usage_count?: number | null
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          user_id?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      gear_items: {
        Row: {
          id: string
          created_at: string | null
          name: string
          description: string | null
          category_id: string
          user_id: string
          quantity: number | null
          weight_kg: number
          is_worn: boolean | null
          image_url: string | null
          location: string | null
          notes: string | null
          volume: string | null
          sizes: string | null
          purpose: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          description?: string | null
          category_id: string
          user_id: string
          quantity?: number | null
          weight_kg: number
          is_worn?: boolean | null
          image_url?: string | null
          location?: string | null
          notes?: string | null
          volume?: string | null
          sizes?: string | null
          purpose?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          description?: string | null
          category_id?: string
          user_id?: string
          quantity?: number | null
          weight_kg?: number
          is_worn?: boolean | null
          image_url?: string | null
          location?: string | null
          notes?: string | null
          volume?: string | null
          sizes?: string | null
          purpose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gear_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      hike_food: {
        Row: {
          id: string
          created_at: string | null
          hike_id: string
          name: string
          calories: number | null
          meal_category: string
          quantity: number | null
          description: string | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          id?: string
          created_at?: string | null
          hike_id: string
          name: string
          calories?: number | null
          meal_category: string
          quantity?: number | null
          description?: string | null
          user_id: string
          weight_kg: number
        }
        Update: {
          id?: string
          created_at?: string | null
          hike_id?: string
          name?: string
          calories?: number | null
          meal_category?: string
          quantity?: number | null
          description?: string | null
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "hike_food_hike_id_fkey"
            columns: ["hike_id"]
            isOneToOne: false
            referencedRelation: "hikes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hike_food_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      hike_gear: {
        Row: {
          id: string
          created_at: string | null
          hike_id: string
          gear_id: string
          quantity: number | null
          is_worn: boolean | null
          notes: string | null
          checked: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          hike_id: string
          gear_id: string
          quantity?: number | null
          is_worn?: boolean | null
          notes?: string | null
          checked?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          hike_id?: string
          gear_id?: string
          quantity?: number | null
          is_worn?: boolean | null
          notes?: string | null
          checked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hike_gear_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hike_gear_hike_id_fkey"
            columns: ["hike_id"]
            isOneToOne: false
            referencedRelation: "hikes"
            referencedColumns: ["id"]
          }
        ]
      }
      hike_logs: {
        Row: {
          id: string
          created_at: string | null
          hike_id: string
          date: string
          notes: string | null
          weather: string | null
          images: string[] | null
          temperature: number | null
          conditions: string[] | null
          mood: number | null
          difficulty: number | null
          title: string | null
          time: string | null
          location: string | null
          distance_km: number | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          hike_id: string
          date: string
          notes?: string | null
          weather?: string | null
          images?: string[] | null
          temperature?: number | null
          conditions?: string[] | null
          mood?: number | null
          difficulty?: number | null
          title?: string | null
          time?: string | null
          location?: string | null
          distance_km?: number | null
        }
        Update: {
          id?: string
          created_at?: string | null
          hike_id?: string
          date?: string
          notes?: string | null
          weather?: string | null
          images?: string[] | null
          temperature?: number | null
          conditions?: string[] | null
          mood?: number | null
          difficulty?: number | null
          title?: string | null
          time?: string | null
          location?: string | null
          distance_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hike_logs_hike_id_fkey"
            columns: ["hike_id"]
            isOneToOne: false
            referencedRelation: "hikes"
            referencedColumns: ["id"]
          }
        ]
      }
      hike_tasks: {
        Row: {
          id: string
          hike_id: string | null
          description: string
          completed: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          hike_id?: string | null
          description: string
          completed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          hike_id?: string | null
          description?: string
          completed?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hike_tasks_hike_id_fkey"
            columns: ["hike_id"]
            isOneToOne: false
            referencedRelation: "hikes"
            referencedColumns: ["id"]
          }
        ]
      }
      hikes: {
        Row: {
          id: string
          created_at: string | null
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          type: string | null
          start_location: string | null
          end_location: string | null
          start_coordinates: Json | null
          end_coordinates: Json | null
          distance_km: number | null
          status: string | null
          user_id: string
          rating_score: number | null
          rating_text: string | null
          difficulty_level: string | null
          terrain_type: string[] | null
          season: string[] | null
          completion_time: number | null
          elevation_gain: number | null
          is_public: boolean | null
          share_id: string | null
          completion_notes: string | null
          images: string[] | null
          image_descriptions: string[] | null
          share_enabled: boolean | null
          share_expires_at: string | null
          share_password: string | null
          share_url: string | null
          share_gallery: boolean | null
          share_logs: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          type?: string | null
          start_location?: string | null
          end_location?: string | null
          start_coordinates?: Json | null
          end_coordinates?: Json | null
          distance_km?: number | null
          status?: string | null
          user_id: string
          rating_score?: number | null
          rating_text?: string | null
          difficulty_level?: string | null
          terrain_type?: string[] | null
          season?: string[] | null
          completion_time?: number | null
          elevation_gain?: number | null
          is_public?: boolean | null
          share_id?: string | null
          completion_notes?: string | null
          images?: string[] | null
          image_descriptions?: string[] | null
          share_enabled?: boolean | null
          share_expires_at?: string | null
          share_password?: string | null
          share_url?: string | null
          share_gallery?: boolean | null
          share_logs?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          type?: string | null
          start_location?: string | null
          end_location?: string | null
          start_coordinates?: Json | null
          end_coordinates?: Json | null
          distance_km?: number | null
          status?: string | null
          user_id?: string
          rating_score?: number | null
          rating_text?: string | null
          difficulty_level?: string | null
          terrain_type?: string[] | null
          season?: string[] | null
          completion_time?: number | null
          elevation_gain?: number | null
          is_public?: boolean | null
          share_id?: string | null
          completion_notes?: string | null
          images?: string[] | null
          image_descriptions?: string[] | null
          share_enabled?: boolean | null
          share_expires_at?: string | null
          share_password?: string | null
          share_url?: string | null
          share_gallery?: boolean | null
          share_logs?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hikes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      links: {
        Row: {
          id: string
          created_at: string | null
          title: string
          url: string
          position: number
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          url: string
          position?: number
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          url?: string
          position?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_category_usage_count: {
        Args: {
          category_id: string
        }
        Returns: unknown
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never