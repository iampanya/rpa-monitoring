import { createClient } from '@supabase/supabase-js'

// Safely access environment variables
// Use (import.meta as any).env to bypass strict type checks and handle cases where env is undefined at runtime
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Check if configuration exists
export const isSupabaseConfigured = 
  typeof supabaseUrl === 'string' && 
  supabaseUrl.length > 0 && 
  typeof supabaseAnonKey === 'string' && 
  supabaseAnonKey.length > 0;

// Fallback values to prevent immediate crash on import if env vars are missing.
// The app handles the 'not configured' state in the UI.
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(validUrl, validKey);