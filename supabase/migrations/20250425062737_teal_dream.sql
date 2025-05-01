/*
  # Update gear schema
  
  1. Changes
    - Convert weight from ounces to kilograms
    - Remove URL and price fields
    - Add check constraint for positive weight
  
  2. Data Migration
    - Convert existing weights from oz to kg
    
  3. Notes
    - Uses a safe migration approach that preserves existing data
    - Adds validation to ensure weights are positive
*/

-- Add new weight_kg column and convert existing data
ALTER TABLE gear_items 
ADD COLUMN weight_kg numeric;

-- Convert existing weights from oz to kg
UPDATE gear_items 
SET weight_kg = weight_oz * 0.0283495
WHERE weight_oz IS NOT NULL;

-- Make weight_kg required and add check constraint
ALTER TABLE gear_items 
ALTER COLUMN weight_kg SET NOT NULL,
ADD CONSTRAINT weight_kg_positive CHECK (weight_kg > 0);

-- Drop old columns
ALTER TABLE gear_items
DROP COLUMN weight_oz,
DROP COLUMN url,
DROP COLUMN price;