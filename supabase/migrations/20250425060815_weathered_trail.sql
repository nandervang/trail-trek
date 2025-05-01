/*
  # Initial Schema Setup

  1. New Tables
    - Categories
    - Gear Items
    - Hikes
    - Hike Gear
    - Hike Food
    - Hike Logs
  2. Security
    - RLS enabled on all tables
    - Policies for user data access
  3. Triggers
    - Default categories for new users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count integer DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own categories" ON categories;
CREATE POLICY "Users can CRUD their own categories"
  ON categories
  FOR ALL
  TO public
  USING (auth.uid() = user_id);

-- Gear items table
CREATE TABLE IF NOT EXISTS gear_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  weight_oz numeric NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text,
  price numeric,
  quantity integer DEFAULT 1
);

ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own gear items" ON gear_items;
CREATE POLICY "Users can CRUD their own gear items"
  ON gear_items
  FOR ALL
  TO public
  USING (auth.uid() = user_id);

-- Hikes table
CREATE TABLE IF NOT EXISTS hikes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  type text,
  start_location text,
  end_location text,
  start_coordinates jsonb,
  end_coordinates jsonb,
  distance_miles numeric,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE hikes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own hikes" ON hikes;
CREATE POLICY "Users can CRUD their own hikes"
  ON hikes
  FOR ALL
  TO public
  USING (auth.uid() = user_id);

-- Hike gear table
CREATE TABLE IF NOT EXISTS hike_gear (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  hike_id uuid NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  gear_id uuid NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  is_worn boolean DEFAULT false,
  notes text
);

ALTER TABLE hike_gear ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own hike gear" ON hike_gear;
CREATE POLICY "Users can CRUD their own hike gear"
  ON hike_gear
  FOR ALL
  TO public
  USING ((SELECT user_id FROM hikes WHERE id = hike_id) = auth.uid());

-- Hike food table
CREATE TABLE IF NOT EXISTS hike_food (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  hike_id uuid NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  name text NOT NULL,
  weight_oz numeric NOT NULL,
  calories integer,
  meal_category text NOT NULL,
  quantity integer DEFAULT 1,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE hike_food ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own hike food" ON hike_food;
CREATE POLICY "Users can CRUD their own hike food"
  ON hike_food
  FOR ALL
  TO public
  USING (auth.uid() = user_id);

-- Hike logs table
CREATE TABLE IF NOT EXISTS hike_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  hike_id uuid NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  date date NOT NULL,
  distance_miles numeric,
  notes text,
  weather text,
  images text[]
);

ALTER TABLE hike_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own hike logs" ON hike_logs;
CREATE POLICY "Users can CRUD their own hike logs"
  ON hike_logs
  FOR ALL
  TO public
  USING ((SELECT user_id FROM hikes WHERE id = hike_id) = auth.uid());

-- Create function to set up default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO categories (name, user_id)
  VALUES 
    ('Shelter', NEW.id),
    ('Sleep System', NEW.id),
    ('Clothing', NEW.id),
    ('Kitchen', NEW.id),
    ('Electronics', NEW.id),
    ('First Aid', NEW.id),
    ('Navigation', NEW.id),
    ('Tools', NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();