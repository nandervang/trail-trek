/*
  # Add image, location and notes to gear items

  1. Changes
    - Add image_url column for storing thumbnail URLs
    - Add location column for storing where the item is kept
    - Add notes column for additional information
    
  2. Notes
    - All fields are optional
    - image_url will store the URL of the uploaded image
*/

ALTER TABLE gear_items
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS notes text;