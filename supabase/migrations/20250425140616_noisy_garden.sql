/*
  # Add is_worn field to gear_items

  1. Changes
    - Add is_worn boolean column to gear_items table
    - Set default value to false
    - Make column nullable to maintain compatibility
*/

ALTER TABLE gear_items
ADD COLUMN is_worn BOOLEAN DEFAULT false;