/*
  # Enhance hike logs with additional fields and metric units

  1. Changes
    - Add title field for log entries
    - Add time field for more precise logging
    - Add location field
    - Convert distance to kilometers
    - Add check constraint for positive distance
    
  2. Notes
    - All new fields are nullable for backward compatibility
    - Safely converts existing distances from miles to kilometers
*/

-- Add new columns
ALTER TABLE hike_logs
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS time time,
ADD COLUMN IF NOT EXISTS location text;

-- Convert existing distances from miles to kilometers
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hike_logs' 
    AND column_name = 'distance_miles'
  ) THEN
    -- Create new column
    ALTER TABLE hike_logs ADD COLUMN distance_km numeric;
    
    -- Convert existing data
    UPDATE hike_logs 
    SET distance_km = CASE 
      WHEN distance_miles > 0 THEN distance_miles * 1.60934
      ELSE NULL
    END
    WHERE distance_miles IS NOT NULL;
    
    -- Drop old column
    ALTER TABLE hike_logs DROP COLUMN distance_miles;
  END IF;
END $$;

-- Add check constraint for positive distance, but only for non-null values
ALTER TABLE hike_logs
ADD CONSTRAINT distance_km_positive CHECK (distance_km IS NULL OR distance_km > 0);

-- Update RLS policy to include new columns
DROP POLICY IF EXISTS "Users can CRUD their own hike logs" ON hike_logs;
CREATE POLICY "Users can CRUD their own hike logs"
  ON hike_logs
  FOR ALL
  TO public
  USING (
    (SELECT user_id FROM hikes WHERE id = hike_id) = auth.uid()
  );