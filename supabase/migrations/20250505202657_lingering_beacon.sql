/*
  # Add additional gear item fields
  
  1. Changes
    - Add volume field for storing item volume/capacity
    - Add sizes field for storing available sizes
    - Add purpose field for storing item's intended use
    
  2. Notes
    - Uses safe DO block to check column existence
    - All fields are optional text fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gear_items' AND column_name = 'volume'
  ) THEN
    ALTER TABLE gear_items ADD COLUMN volume text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gear_items' AND column_name = 'sizes'
  ) THEN
    ALTER TABLE gear_items ADD COLUMN sizes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gear_items' AND column_name = 'purpose'
  ) THEN
    ALTER TABLE gear_items ADD COLUMN purpose text;
  END IF;
END $$;