import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const hikeId = formData.get('hikeId') as string;

    if (!file || !hikeId) {
      throw new Error('File and hikeId are required');
    }

    // Convert File to Blob for upload
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer]);

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${hikeId}/${timestamp}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('hike-images')
      .upload(filename, blob, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('hike-images')
      .getPublicUrl(filename);

    if (urlError) {
      throw urlError;
    }

    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});