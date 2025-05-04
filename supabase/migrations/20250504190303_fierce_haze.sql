/*
  # Convert distance measurements from miles to kilometers
  
  1. Changes
    - Add distance_km column to hikes table
    - Convert existing distances from miles to kilometers
    - Drop distance_miles column
    
  2. Notes
    - Safe migration that preserves existing data
    - Uses conversion factor of 1.60934 (miles to km)
*/

-- Add new distance_km column
ALTER TABLE hikes
ADD COLUMN distance_km numeric;

-- Convert existing distances from miles to kilometers
UPDATE hikes 
SET distance_km = distance_miles * 1.60934
WHERE distance_miles IS NOT NULL;

-- Drop old distance_miles column
ALTER TABLE hikes
DROP COLUMN distance_miles;