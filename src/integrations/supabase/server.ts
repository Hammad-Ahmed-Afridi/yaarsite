import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vpfrtytxeimezwxhhtuf.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZnJ0eXR4ZWltZXp3eGhodHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzkxMzcsImV4cCI6MjA3NDMxNTEzN30.l964YeRl-cJPEHTqR3zDsO6rCd0uyIiFlOU4QU7GKZk";

export const createPublicServerSupabaseClient = () => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
};