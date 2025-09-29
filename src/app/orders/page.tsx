"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Trash2, Edit, ShoppingCart, Loader2 } from 'lucide-react';
import { useSession } from '@/components/session-context-provider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header'; // Import DashboardHeader

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

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setIsLoadingOrders(false);
      return;
    }
    setIsLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders.");
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setIsLoadingOrders(false);
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchOrders();
    }
  }, [isSessionLoading, user, fetchOrders]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdatingStatus(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status.");
    } else {
      toast.success("Order status updated successfully!");
      fetchOrders();
    }
    setIsUpdatingStatus(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    setIsDeletingOrder(true);
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order.");
    } else {
      toast.success("Order deleted successfully!");
      fetchOrders();
    }
    setIsDeletingOrder(false);
  };

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} currentPath={pathname} />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Order Management</h2>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg p-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">No Orders Yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Customers will place orders through your public store.
            </p>
            <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
          </div>
        ) : (
          <Card className="bg-card text-card-foreground shadow-md">
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto"> {/* Added for responsiveness */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer Email</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{order.customer_email}</TableCell>
                        <TableCell>Rs{order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(newStatus: Order['status']) => handleUpdateOrderStatus(order.id, newStatus)}
                            disabled={isUpdatingStatus}
                          >
                            <SelectTrigger className="min-w-[120px] w-full max-w-[180px]"> {/* Adjusted width */}
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toast.info("Edit order details coming soon!")}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete this order
                                      and remove its data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteOrder(order.id)}
                                      disabled={isDeletingOrder}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {isDeletingOrder ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}