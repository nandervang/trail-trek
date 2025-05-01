/*
  # Create initial schema for TrailTrek

  1. New Tables
    - `categories` - Store gear categories
    - `gear_items` - Store user's gear inventory
    - `hikes` - Store hike plans and logs
    - `hike_gear` - Junction table for hikes and gear
    - `hike_food` - Store food plans for hikes
    - `hike_logs` - Store daily logs for completed hikes
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own categories"
  ON categories
  USING (auth.uid() = user_id);

-- Gear Items Table
CREATE TABLE IF NOT EXISTS gear_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  weight_oz DECIMAL NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT,
  price DECIMAL,
  quantity INTEGER DEFAULT 1
);

ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own gear items"
  ON gear_items
  USING (auth.uid() = user_id);

-- Hikes Table
CREATE TABLE IF NOT EXISTS hikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  type TEXT,
  start_location TEXT,
  end_location TEXT,
  start_coordinates JSONB,
  end_coordinates JSONB,
  distance_miles DECIMAL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE hikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own hikes"
  ON hikes
  USING (auth.uid() = user_id);

-- Hike Gear Junction Table
CREATE TABLE IF NOT EXISTS hike_gear (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hike_id UUID NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  gear_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  is_worn BOOLEAN DEFAULT FALSE,
  notes TEXT
);

ALTER TABLE hike_gear ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own hike gear"
  ON hike_gear
  USING (
    (SELECT user_id FROM hikes WHERE id = hike_id) = auth.uid()
  );

-- Hike Food Table
CREATE TABLE IF NOT EXISTS hike_food (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hike_id UUID NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_oz DECIMAL NOT NULL,
  calories INTEGER,
  meal_category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE hike_food ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own hike food"
  ON hike_food
  USING (auth.uid() = user_id);

-- Hike Logs Table
CREATE TABLE IF NOT EXISTS hike_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hike_id UUID NOT NULL REFERENCES hikes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  distance_miles DECIMAL,
  notes TEXT,
  weather TEXT,
  images TEXT[]
);

ALTER TABLE hike_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own hike logs"
  ON hike_logs
  USING (
    (SELECT user_id FROM hikes WHERE id = hike_id) = auth.uid()
  );

-- Default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (name, user_id)
  VALUES 
    ('Shelter', NEW.id),
    ('Sleeping', NEW.id),
    ('Kitchen', NEW.id),
    ('Clothing', NEW.id),
    ('Navigation', NEW.id),
    ('First Aid', NEW.id),
    ('Electronics', NEW.id),
    ('Food', NEW.id),
    ('Hydration', NEW.id),
    ('Backpack', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();