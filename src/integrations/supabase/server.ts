import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This file is used to create a Supabase client that can be used in Server Components and Server Actions.
// It reads the user's session from cookies.

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore, // Simplified to directly pass the cookieStore
    }
  );
}