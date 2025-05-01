/*
  # Create storage bucket for gear images
  
  1. New Storage Bucket
    - Create a new public bucket for storing gear images
    - Enable public access for image URLs
    - Set up security policies
    
  2. Notes
    - Safely handles existing policies
    - Uses IF NOT EXISTS to prevent duplicate errors
*/

-- Create a new storage bucket for gear images if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('gear-images', 'gear-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
END $$;

-- Create policies
CREATE POLICY "Users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gear-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gear-images');

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gear-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);