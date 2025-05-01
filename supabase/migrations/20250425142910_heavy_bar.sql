/*
  # Add checked status to hike gear

  1. Changes
    - Add checked field to hike_gear table to track packing status
    
  2. Notes
    - Skipping hike_tasks.completed as it already exists
*/

-- Add checked field to hike_gear table
ALTER TABLE hike_gear
ADD COLUMN checked BOOLEAN DEFAULT false;