/*
  # Add new columns to hike_logs table

  1. Changes
    - Add temperature field for recording temperature in Celsius
    - Add conditions array for storing multiple weather conditions
    - Add mood rating (1-5 scale)
    - Add difficulty rating (1-5 scale)
    
  2. Notes
    - All new fields are nullable to maintain compatibility
    - Adds constraints to ensure valid ratings
*/

ALTER TABLE hike_logs
ADD COLUMN temperature integer,
ADD COLUMN conditions text[],
ADD COLUMN mood integer CHECK (mood >= 1 AND mood <= 5),
ADD COLUMN difficulty integer CHECK (difficulty >= 1 AND difficulty <= 5);

-- Update the RLS policy to include new columns
DROP POLICY IF EXISTS "Users can CRUD their own hike logs" ON hike_logs;
CREATE POLICY "Users can CRUD their own hike logs"
  ON hike_logs
  FOR ALL
  TO public
  USING (
    (SELECT user_id FROM hikes WHERE id = hike_id) = auth.uid()
  );