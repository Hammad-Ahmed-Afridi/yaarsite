import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/integrations/supabase/server';
import { SettingsClientPage } from './settings-client-page'; // New client component
import { Profile } from "@/components/session-context-provider";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;
  let profile: Profile | null = null;

  try {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Settings Page (Server): Error fetching profile:", profileError);
    } else {
      profile = profileData as Profile;
    }

  } catch (error) {
    console.error("Settings Page (Server): Unexpected error fetching data:", error);
  }

  return (
    <SettingsClientPage profile={profile} />
  );
}