import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Vite exposes environment variables on import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Add error handling for malformed URLs
try {
  // Validate URL format
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', error);
  throw new Error('Invalid Supabase URL format. Please check your environment variables.');
}

// Create the Supabase client with additional options
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true // Enable session detection in URL
    },
    global: {
      headers: {
        'x-application-name': 'hiking-gear-tracker',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }
);

// Test the connection with better error handling and retry logic
const testConnection = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { error } = await supabase.from('gear_items').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      console.log('Successfully connected to Supabase');
      return;
    } catch (error: any) {
      // More detailed error logging
      console.error('Supabase connection attempt failed:', {
        attempt: i + 1,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      if (i === retries - 1) {
        // If this is the last retry, throw the error
        if (error.code === 'PGRST301') {
          console.error('Authentication failed. Please check your Supabase anon key.');
        } else if (error.code?.includes('CORS')) {
          console.error('CORS error detected. Please check your Supabase URL and CORS configuration in the Supabase dashboard.');
          console.error('Ensure that your application origin (http://localhost:5173) is allowed in the CORS configuration.');
        } else if (error.message?.includes('fetch')) {
          console.error('Network error. Please check your internet connection and Supabase URL.');
        }
        
        throw new Error(`Failed to establish Supabase connection after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initialize connection test
testConnection().catch(error => {
  console.error('Final connection error:', error);
});