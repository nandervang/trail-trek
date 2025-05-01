/*
  # Convert all weights to metric (kilograms)

  1. Changes
    - Convert hike_food weights from oz to kg
    - Add check constraint for positive weights
    - Skip gear_items constraint since it already exists
*/

-- Convert hike_food weights from oz to kg
ALTER TABLE hike_food
ADD COLUMN weight_kg numeric;

UPDATE hike_food
SET weight_kg = weight_oz * 0.0283495
WHERE weight_oz IS NOT NULL;

ALTER TABLE hike_food
ALTER COLUMN weight_kg SET NOT NULL,
DROP COLUMN weight_oz;

-- Add check constraint for positive weights (only for hike_food)
ALTER TABLE hike_food
ADD CONSTRAINT food_weight_kg_positive CHECK (weight_kg > 0);