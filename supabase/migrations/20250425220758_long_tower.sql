/*
  # Add new columns to hike_logs table
  
  1. Changes
    - Add title column for log entries
    - Add time column for tracking specific times
    - Add location column for specific locations
    - Add distance_km column for metric distances
  
  2. Notes
    - Skip constraint creation since it already exists
    - All new columns are nullable to maintain compatibility
*/

-- Add new columns
ALTER TABLE hike_logs
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS time time without time zone,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS distance_km numeric;