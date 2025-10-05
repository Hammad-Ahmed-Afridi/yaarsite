import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your deployment environment (e.g., Vercel)
// Using hardcoded values as fallback for local development if env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vpfrtytxeimezwxhhtuf.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZnJ0eXR4ZWltZXp3eGhodHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzkxMzcsImexZCI6MjA3NDMxNTEzN30.l964YeRl-cJPEHTqR3zDsO6rCd0uyIiFlOU4QU7GKZk";

export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // No session persistence on the server
    },
  });
};

export const supabaseServer = createServerClient();