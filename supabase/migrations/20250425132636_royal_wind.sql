/*
  # Update gear weights to use kilograms
  
  1. Changes
    - Make weight_kg required
  
  2. Notes
    - Ensures all weights are stored in kilograms
*/

-- Make weight_kg required
ALTER TABLE gear_items 
ALTER COLUMN weight_kg SET NOT NULL;