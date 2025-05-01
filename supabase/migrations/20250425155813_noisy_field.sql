/*
  # Add checked column to hike_gear table

  1. Changes
    - Add `checked` column to `hike_gear` table with default value of false
    
  2. Purpose
    - Enables tracking whether gear items have been checked/packed for a hike
    - Supports the gear checklist functionality in the planner view
*/

ALTER TABLE hike_gear 
ADD COLUMN IF NOT EXISTS checked boolean DEFAULT false;