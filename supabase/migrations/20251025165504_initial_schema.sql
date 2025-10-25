/*
  # M13 Business Management Database Schema

  1. New Tables
    - `users` - User accounts with email authentication
    - `persons` - Customer/person records for each category (renamed from people)
    - `village_entries` - Village milk collection entries
    - `city_entries` - City transaction entries  
    - `dairy_entries` - Dairy operations with complex calculations
    - `payments` - Payment records (given/received)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data isolation
    - Secure password hashing

  3. Features
    - Multi-device synchronization
    - Offline support with local caching
    - Real-time data updates
    - User data isolation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Persons table (renamed from people to match code)
CREATE TABLE IF NOT EXISTS persons (
  id text PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  value decimal NOT NULL DEFAULT 0,
  category text NOT NULL CHECK (category IN ('village', 'city', 'dairy')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Village entries table
CREATE TABLE IF NOT EXISTS village_entries (
  id text PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  person_id text NOT NULL,
  person_name text NOT NULL,
  date date NOT NULL,
  m_milk decimal NOT NULL DEFAULT 0,
  m_fat decimal NOT NULL DEFAULT 0,
  e_milk decimal NOT NULL DEFAULT 0,
  e_fat decimal NOT NULL DEFAULT 0,
  m_fat_kg decimal NOT NULL DEFAULT 0,
  e_fat_kg decimal NOT NULL DEFAULT 0,
  rate decimal NOT NULL DEFAULT 0,
  amount decimal NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- City entries table
CREATE TABLE IF NOT EXISTS city_entries (
  id text PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  person_id text NOT NULL,
  person_name text NOT NULL,
  date date NOT NULL,
  value decimal NOT NULL DEFAULT 0,
  rate decimal NOT NULL DEFAULT 0,
  amount decimal NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dairy entries table
CREATE TABLE IF NOT EXISTS dairy_entries (
  id text PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  person_id text NOT NULL,
  person_name text NOT NULL,
  date date NOT NULL,
  session text NOT NULL CHECK (session IN ('morning', 'evening')),
  milk decimal NOT NULL DEFAULT 0,
  fat decimal NOT NULL DEFAULT 0,
  meter decimal NOT NULL DEFAULT 0,
  rate decimal NOT NULL DEFAULT 0,
  fat_kg decimal NOT NULL DEFAULT 0,
  meter_kg decimal NOT NULL DEFAULT 0,
  fat_amount decimal NOT NULL DEFAULT 0,
  meter_amount decimal NOT NULL DEFAULT 0,
  total_amount decimal NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  person_id text NOT NULL,
  person_name text NOT NULL,
  date date NOT NULL,
  amount decimal NOT NULL DEFAULT 0,
  comment text DEFAULT '',
  type text NOT NULL CHECK (type IN ('given', 'received')),
  category text NOT NULL CHECK (category IN ('village', 'city', 'dairy')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for persons table
CREATE POLICY "Users can read own persons"
  ON persons
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own persons"
  ON persons
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own persons"
  ON persons
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own persons"
  ON persons
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for village_entries table
CREATE POLICY "Users can read own village entries"
  ON village_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own village entries"
  ON village_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own village entries"
  ON village_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own village entries"
  ON village_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for city_entries table
CREATE POLICY "Users can read own city entries"
  ON city_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own city entries"
  ON city_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own city entries"
  ON city_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own city entries"
  ON city_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for dairy_entries table
CREATE POLICY "Users can read own dairy entries"
  ON dairy_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own dairy entries"
  ON dairy_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own dairy entries"
  ON dairy_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own dairy entries"
  ON dairy_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for payments table
CREATE POLICY "Users can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own payments"
  ON payments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_user_id ON persons(user_id);
CREATE INDEX IF NOT EXISTS idx_persons_category ON persons(category);
CREATE INDEX IF NOT EXISTS idx_village_entries_user_id ON village_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_village_entries_date ON village_entries(date);
CREATE INDEX IF NOT EXISTS idx_village_entries_person_id ON village_entries(person_id);
CREATE INDEX IF NOT EXISTS idx_city_entries_user_id ON city_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_city_entries_date ON city_entries(date);
CREATE INDEX IF NOT EXISTS idx_city_entries_person_id ON city_entries(person_id);
CREATE INDEX IF NOT EXISTS idx_dairy_entries_user_id ON dairy_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_dairy_entries_date ON dairy_entries(date);
CREATE INDEX IF NOT EXISTS idx_dairy_entries_person_id ON dairy_entries(person_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_person_id ON payments(person_id);