import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/integrations/supabase/server'; // Import server client

import LoginPageClient from './login-client'; // Import the new client component

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/'); // Redirect authenticated users to dashboard
  }

  return <LoginPageClient />;
}