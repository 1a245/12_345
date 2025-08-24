import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getRuntimeConfig, validateEnvironment } from "../config/env";

// Create Supabase client with runtime configuration
let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const { url, anonKey } = getRuntimeConfig();

    // Validate that we have proper credentials
    if (!url || !anonKey) {
      throw new Error(
        "Supabase environment variables not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
      );
    }

    if (!url.includes("supabase.co")) {
      throw new Error(
        'Invalid Supabase URL format. URL must contain "supabase.co"'
      );
    }

    if (anonKey.length < 50) {
      throw new Error(
        "Invalid Supabase anonymous key format. Key must be at least 50 characters long."
      );
    }

    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
};

// Validate environment variables
const hasRealCredentials = () => {
  return validateEnvironment();
};

// Export a lazy client getter (don't initialize until actually needed)
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof SupabaseClient];
  },
});

export const hasSupabaseCredentials = () => {
  return hasRealCredentials();
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          updated_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          value: number;
          category: "village" | "city" | "dairy";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          value: number;
          category: "village" | "city" | "dairy";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          value?: number;
          category?: "village" | "city" | "dairy";
          updated_at?: string;
        };
      };
      village_entries: {
        Row: {
          id: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          m_milk: number;
          m_fat: number;
          e_milk: number;
          e_fat: number;
          m_fat_kg: number;
          e_fat_kg: number;
          rate: number;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          m_milk: number;
          m_fat: number;
          e_milk: number;
          e_fat: number;
          m_fat_kg: number;
          e_fat_kg: number;
          rate: number;
          amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          person_id?: string;
          person_name?: string;
          date?: string;
          m_milk?: number;
          m_fat?: number;
          e_milk?: number;
          e_fat?: number;
          m_fat_kg?: number;
          e_fat_kg?: number;
          rate?: number;
          amount?: number;
          updated_at?: string;
        };
      };
      city_entries: {
        Row: {
          id: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          value: number;
          rate: number;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          value: number;
          rate: number;
          amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          person_id?: string;
          person_name?: string;
          date?: string;
          value?: number;
          rate?: number;
          amount?: number;
          updated_at?: string;
        };
      };
      dairy_entries: {
        Row: {
          id: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          session: "morning" | "evening";
          milk: number;
          fat: number;
          meter: number;
          rate: number;
          fat_kg: number;
          meter_kg: number;
          fat_amount: number;
          meter_amount: number;
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          session: "morning" | "evening";
          milk: number;
          fat: number;
          meter: number;
          rate: number;
          fat_kg: number;
          meter_kg: number;
          fat_amount: number;
          meter_amount: number;
          total_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          person_id?: string;
          person_name?: string;
          date?: string;
          session?: "morning" | "evening";
          milk?: number;
          fat?: number;
          meter?: number;
          rate?: number;
          fat_kg?: number;
          meter_kg?: number;
          fat_amount?: number;
          meter_amount?: number;
          total_amount?: number;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          amount: number;
          comment: string;
          type: "given" | "received";
          category: "village" | "city" | "dairy";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          person_id: string;
          person_name: string;
          date: string;
          amount: number;
          comment: string;
          type: "given" | "received";
          category: "village" | "city" | "dairy";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          person_id?: string;
          person_name?: string;
          date?: string;
          amount?: number;
          comment?: string;
          type?: "given" | "received";
          category?: "village" | "city" | "dairy";
          updated_at?: string;
        };
      };
    };
  };
}
