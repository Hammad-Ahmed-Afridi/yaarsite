import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This file is used to create a Supabase client that can be used in Server Components and Server Actions.
// It reads the user's session from cookies.

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // Await the cookies() call

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, _options: CookieOptions) { // Ignore options for delete as next/headers delete doesn't use them
          cookieStore.delete(name);
        },
      },
    }
  );
}