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
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Server Action.
            // This error is typically not a problem if you're only setting cookies in a Server Action
            // or if the cookie is already set by the client-side Supabase client.
            console.warn('Could not set cookie from Server Component/Action:', error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('Could not remove cookie from Server Component/Action:', error);
          }
        },
      },
    }
  );
}