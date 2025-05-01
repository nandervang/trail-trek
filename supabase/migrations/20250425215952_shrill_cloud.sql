/*
  # Enhance hike logs with new fields

  1. Changes
    - Add title, time, and location fields
    - Add distance_km field for metric measurements
  
  2. Notes
    - All new fields are nullable
    - Constraint already exists from previous migration
*/

-- Add new columns
ALTER TABLE hike_logs
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS time time without time zone,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS distance_km numeric;