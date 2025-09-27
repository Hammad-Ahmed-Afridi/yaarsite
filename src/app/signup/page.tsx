import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/integrations/supabase/server'; // Import server client

import SignupPageClient from './signup-client'; // Import the new client component

export default async function SignupPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/'); // Redirect authenticated users to dashboard
  }

  return <SignupPageClient />;
}