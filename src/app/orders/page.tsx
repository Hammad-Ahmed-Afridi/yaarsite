"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Trash2, Edit, ShoppingCart, ArrowLeft, Wallet, Banknote, Smartphone } from 'lucide-react'; // Import ArrowLeft, Wallet, Banknote, Smartphone
import { useSession } from '@/components/session-context-provider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppLoader } from '@/components/app-loader';
import Link from 'next/link'; // Import Link

interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_address_line: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items_json: any[];
  payment_method: string; // New: payment_method
  created_at: string;
  updated_at: string;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash on Delivery':
        return <Banknote className="h-4 w-4 text-green-600" />;
      case 'JazzCash':
        return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'EasyPaisa':
        return <Wallet className="h-4 w-4 text-teal-600" />;
      default:
        return null;
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
      <AppLoader message="Loading orders..." />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} /> {/* Removed currentPath */}

      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-3xl p-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4 font-semibold">No Orders Yet</p>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              Customers will place orders through your public store.
            </p>
            <Button onClick={() => router.push('/')} className="font-semibold">Go to Dashboard</Button>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-card text-card-foreground shadow-md rounded-3xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Order ID: {order.id.substring(0, 8)}...</CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">Customer: {order.customer_name} ({order.customer_email})</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-base">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Phone:</span>
                        <span>{order.customer_phone}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium">Address:</span>
                        <div className="text-right leading-relaxed">
                          <span>{order.shipping_address_line},</span><br/>
                          <span>{order.shipping_city}, {order.shipping_province}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total:</span>
                        <span>Rs{order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payment Method:</span>
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(order.payment_method)}
                          {order.payment_method}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <Select
                          value={order.status}
                          onValueChange={(newStatus: Order['status']) => handleUpdateOrderStatus(order.id, newStatus)}
                          disabled={isUpdatingStatus}
                        >
                          <SelectTrigger className="w-[140px] font-medium">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="font-medium">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Date:</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-end mt-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="font-semibold">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg font-semibold">Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-base leading-relaxed">
                                This action cannot be undone. This will permanently delete this order.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={isDeletingOrder}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                              >
                                {isDeletingOrder ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card text-card-foreground shadow-md rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Order ID</TableHead>
                          <TableHead className="font-semibold">Customer Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Address</TableHead>
                          <TableHead className="font-semibold">Total Amount</TableHead>
                          <TableHead className="font-semibold">Payment Method</TableHead> {/* New column */}
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Order Date</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium text-base">{order.id.substring(0, 8)}...</TableCell>
                            <TableCell className="text-base">{order.customer_name}</TableCell>
                            <TableCell className="text-base">{order.customer_email}</TableCell>
                            <TableCell className="text-base">{order.customer_phone}</TableCell>
                            <TableCell className="text-base">
                              {order.shipping_address_line}, {order.shipping_city}, {order.shipping_province}
                            </TableCell>
                            <TableCell className="text-base">Rs{order.total_amount.toFixed(2)}</TableCell>
                            <TableCell className="text-base flex items-center gap-1"> {/* Display payment method */}
                              {getPaymentMethodIcon(order.payment_method)}
                              {order.payment_method}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(newStatus: Order['status']) => handleUpdateOrderStatus(order.id, newStatus)}
                                disabled={isUpdatingStatus}
                              >
                                <SelectTrigger className="w-[180px] font-medium">
                                  <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status} className="font-medium">
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-base">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="font-semibold">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-lg font-semibold">Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-base leading-relaxed">
                                      This action cannot be undone. This will permanently delete this order.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="font-medium">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteOrder(order.id)}
                                      disabled={isDeletingOrder}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                                    >
                                      {isDeletingOrder ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}