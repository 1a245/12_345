import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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