export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      dishes: {
        Row: {
          id: string
          name: string
          price: number
          image_url: string | null
          category: string | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          image_url?: string | null
          category?: string | null
          is_available?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['dishes']['Insert']>
      }
      orders: {
        Row: {
          id: string
          created_at: string
          type: 'dine-in' | 'delivery'
          table_number: string | null
          customer_name: string | null
          phone: string | null
          address: string | null
          note: string | null
          total: number
          status: 'new' | 'preparing' | 'done' | 'cancelled'
        }
        Insert: {
          id?: string
          created_at?: string
          type: 'dine-in' | 'delivery'
          table_number?: string | null
          customer_name?: string | null
          phone?: string | null
          address?: string | null
          note?: string | null
          total: number
          status?: 'new' | 'preparing' | 'done' | 'cancelled'
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          dish_id: string
          qty: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          dish_id: string
          qty: number
          price: number
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
