/*
  # Enhance hikes with rating and sharing features

  1. Changes
    - Add rating fields to hikes table
    - Add sharing and visibility fields
    - Add completion details
  
  2. Notes
    - All new fields are nullable to maintain compatibility
    - Share URLs will be generated based on the hike ID
*/

-- Add new columns to hikes table
ALTER TABLE hikes
ADD COLUMN rating_score INTEGER CHECK (rating_score >= 1 AND rating_score <= 5),
ADD COLUMN rating_text TEXT,
ADD COLUMN difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging', 'difficult', 'extreme')),
ADD COLUMN terrain_type TEXT[],
ADD COLUMN season TEXT[] CHECK (season <@ ARRAY['spring', 'summer', 'fall', 'winter']),
ADD COLUMN completion_time INTEGER, -- In minutes
ADD COLUMN elevation_gain INTEGER, -- In meters
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN share_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN completion_notes TEXT;

-- Create index for share_id
CREATE UNIQUE INDEX hikes_share_id_idx ON hikes(share_id) WHERE is_public = true;

-- Add policy for public access to shared hikes
CREATE POLICY "Anyone can view public hikes"
  ON hikes
  FOR SELECT
  TO public
  USING (is_public = true);