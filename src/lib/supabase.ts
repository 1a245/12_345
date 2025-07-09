import { createClient } from '@supabase/supabase-js';

// Check if we have real Supabase credentials
const hasRealCredentials = () => {
  return import.meta.env.VITE_SUPABASE_URL && 
         import.meta.env.VITE_SUPABASE_ANON_KEY &&
         import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
         import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key';
};

// Use valid dummy values if environment variables are not properly set
const supabaseUrl = hasRealCredentials() 
  ? import.meta.env.VITE_SUPABASE_URL 
  : 'https://placeholder.supabase.co';
const supabaseAnonKey = hasRealCredentials() 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjM0NTYsImV4cCI6MTk2MDY5OTQ1Nn0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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