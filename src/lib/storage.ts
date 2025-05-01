import { supabase } from './supabase';

export async function uploadImage(file: File, hikeId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('hikeId', hikeId);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  const { url } = await response.json();
  return url;
}

export async function deleteImage(url: string): Promise<void> {
  // Extract the path from the URL
  const path = url.split('/').slice(-2).join('/');
  
  const { error } = await supabase.storage
    .from('hike-images')
    .remove([path]);

  if (error) {
    throw error;
  }
}