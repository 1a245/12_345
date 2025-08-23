import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('kamal', supabaseUrl, supabaseAnonKey)

// Debug environment variables
console.log('🔧 Environment Variables Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

// Check if we have real Supabase credentials
const hasRealCredentials = () => {
  const hasUrl = !!supabaseUrl && supabaseUrl.includes('supabase.co');
  const hasKey = !!supabaseAnonKey && supabaseAnonKey.length > 50;
  
  console.log('🔍 Credentials Check:');
  console.log('Has URL:', hasUrl);
  console.log('Has Key:', hasKey);
  console.log('URL valid:', supabaseUrl.includes('supabase.co'));
  
  return hasUrl && hasKey;
};

// Create Supabase client with proper configuration
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-client-info': 'm13-business-app'
      }
    }
  }
);

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
          category: 'village' | 'city' | 'dairy';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          value: number;
          category: 'village' | 'city' | 'dairy';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          value?: number;
          category?: 'village' | 'city' | 'dairy';
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
          session: 'morning' | 'evening';
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
          session: 'morning' | 'evening';
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
          session?: 'morning' | 'evening';
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
          type: 'given' | 'received';
          category: 'village' | 'city' | 'dairy';
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
          type: 'given' | 'received';
          category: 'village' | 'city' | 'dairy';
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
          type?: 'given' | 'received';
          category?: 'village' | 'city' | 'dairy';
          updated_at?: string;
        };
      };
    };
  };
}