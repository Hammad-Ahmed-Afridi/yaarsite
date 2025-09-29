import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/integrations/supabase/server';
import { OrdersClientPage } from './orders-client-page'; // New client component
import { Profile } from "@/components/session-context-provider";

interface Order {
  id: string;
  user_id: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items_json: any[];
  created_at: string;
  updated_at: string;
}

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient(); // Add await
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;
  let profile: Profile | null = null;
  let orders: Order[] = [];

  try {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Orders Page (Server): Error fetching profile:", profileError);
    } else {
      profile = profileData as Profile;
    }

    // Fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error("Orders Page (Server): Error fetching orders:", ordersError);
    } else {
      orders = ordersData || [];
    }

  } catch (error) {
    console.error("Orders Page (Server): Unexpected error fetching data:", error);
  }

  return (
    <OrdersClientPage profile={profile} initialOrders={orders} />
  );
}