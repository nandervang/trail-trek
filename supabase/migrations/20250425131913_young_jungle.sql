/*
  # Add image gallery support to hikes

  1. Changes
    - Add images column to hikes table to store image URLs
    - Add image_descriptions column for accessibility
  
  2. Notes
    - Uses text[] to store multiple image URLs
    - Descriptions are optional but recommended for accessibility
*/

ALTER TABLE hikes
ADD COLUMN images TEXT[],
ADD COLUMN image_descriptions TEXT[];

-- Update the public access policy to include the new columns
DROP POLICY IF EXISTS "Anyone can view public hikes" ON hikes;
CREATE POLICY "Anyone can view public hikes"
  ON hikes
  FOR SELECT
  TO public
  USING (is_public = true);