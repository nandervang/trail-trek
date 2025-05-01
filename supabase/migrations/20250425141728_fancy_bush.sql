/*
  # Add storage bucket for hike images
  
  1. New Storage Bucket
    - Create a new public bucket for storing hike images
    - Enable public access for image URLs
    - Set up security policies
*/

-- Create a new storage bucket for hike images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hike-images', 'hike-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hike-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to read images
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hike-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hike-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);