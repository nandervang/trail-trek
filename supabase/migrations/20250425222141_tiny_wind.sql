/*
  # Add sharing functionality to hikes

  1. Changes
    - Add share_enabled boolean flag
    - Add share_expires_at for expiration
    - Add share_password for protection
    - Add share_url for public links
    
  2. Security
    - Add policy for public access to shared hikes
    - Ensure only owners can modify sharing settings
*/

-- Add sharing columns
ALTER TABLE hikes
ADD COLUMN share_enabled boolean DEFAULT false,
ADD COLUMN share_expires_at timestamptz,
ADD COLUMN share_password text,
ADD COLUMN share_url text;

-- Create index for share_id lookup
CREATE UNIQUE INDEX IF NOT EXISTS hikes_share_id_idx ON hikes(share_id) WHERE share_enabled = true;

-- Create function to update share_url
CREATE OR REPLACE FUNCTION update_share_url()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.share_enabled THEN
      NEW.share_url := concat('/shared/', NEW.share_id);
    ELSE
      NEW.share_url := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain share_url
CREATE TRIGGER update_share_url_trigger
  BEFORE INSERT OR UPDATE ON hikes
  FOR EACH ROW
  EXECUTE FUNCTION update_share_url();

-- Update public access policy
DROP POLICY IF EXISTS "Anyone can view public hikes" ON hikes;
CREATE POLICY "Anyone can view shared hikes"
ON hikes
FOR SELECT
TO public
USING (
  share_enabled = true 
  AND (
    share_expires_at IS NULL 
    OR share_expires_at > now()
  )
);

-- Add RLS policies for sharing management
CREATE POLICY "Users can manage sharing settings for their hikes"
ON hikes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);