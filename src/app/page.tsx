import { MadeWithDyad } from "@/components/made-with-dyad";
import { createSupabaseServerClient } from '@/integrations/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClientPage } from './dashboard-client-page'; // New client component for interactivity
import { Profile } from "@/components/session-context-provider"; // Import Profile type

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  user_id: string;
  image_urls: string[] | null;
  created_at: string;
}

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

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login'); // Redirect unauthenticated users
  }

  const user = session.user;
  let profile: Profile | null = null;
  let totalProducts = 0;
  let totalOrders = 0;
  let totalProfit = 0;

  try {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Dashboard Page (Server): Error fetching profile:", profileError);
    } else {
      profile = profileData as Profile;
    }

    // Fetch total products
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (productsError) {
      console.error("Dashboard Page (Server): Error fetching products count:", productsError);
    } else {
      totalProducts = productsCount || 0;
    }

    // Fetch total orders
    const { count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (ordersError) {
      console.error("Dashboard Page (Server): Error fetching orders count:", ordersError);
    } else {
      totalOrders = ordersCount || 0;
    }

    // Fetch total profit
    const { data: profitData, error: profitError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', user.id)
      .eq('status', 'delivered');

    if (profitError) {
      console.error("Dashboard Page (Server): Error fetching profit data:", profitError);
    } else {
      totalProfit = profitData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    }

  } catch (error) {
    console.error("Dashboard Page (Server): Unexpected error fetching dashboard data:", error);
  }

  return (
    <DashboardClientPage
      profile={profile}
      totalProducts={totalProducts}
      totalOrders={totalOrders}
      totalProfit={totalProfit}
    />
  );
}