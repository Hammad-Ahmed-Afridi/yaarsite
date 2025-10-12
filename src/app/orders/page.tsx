"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Edit, ShoppingCart, ArrowLeft, Wallet, Banknote, Smartphone, Printer } from 'lucide-react'; // Added Printer icon
import { useSession, Profile } from '@/components/session-context-provider'; // Import Profile type
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppLoader } from '@/components/app-loader';
import Link from 'next/link';
import { InvoiceDocument } from '@/components/invoice-document'; // Import InvoiceDocument

export interface Order { // Exported for use in InvoiceDocument
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
  items_json: Array<{
    id: string; // Product ID
    variantId?: string; // New: Variant ID
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    selectedAttributes?: { [key: string]: string }; // New: Selected variant attributes
  }>;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
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

  const handlePrintInvoice = (order: Order, storeProfile: Profile) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<!DOCTYPE html><html><head><title>Invoice</title>');
      // Include Tailwind CSS for basic styling in the print window
      printWindow.document.write('<link href="/globals.css" rel="stylesheet">'); // Adjust path if necessary
      printWindow.document.write('</head><body><div id="invoice-root"></div></body></html>');
      printWindow.document.close();

      // Render the InvoiceDocument component into the new window
      const invoiceRoot = printWindow.document.getElementById('invoice-root');
      if (invoiceRoot) {
        // Using ReactDOM.createRoot for React 18+
        const root = (window as any).ReactDOM.createRoot(invoiceRoot);
        root.render(<InvoiceDocument order={order} storeProfile={storeProfile} />);
      }

      // Wait for content to render and then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000); // Give it a second to render
    } else {
      toast.error("Failed to open print window. Please allow pop-ups.");
    }
  };

  if (isLoadingOrders || isSessionLoading) {
    return (
      <AppLoader message="Loading orders..." />
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Configured</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">Please set up your store first from the dashboard.</p>
        <Button asChild className="font-semibold">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} />

      <main className="flex-1 p-4 sm:p-8">
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-card text-card-foreground shadow-md rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Order ID: {order.id.substring(0, 8)}...</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">Customer: {order.customer_name} ({order.customer_email})</p>
                </CardHeader>
                <CardContent className="space-y-2 text-base">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center"> {/* Responsive flex */}
                    <span className="font-medium">Phone:</span>
                    <span>{order.customer_phone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start"> {/* Responsive flex */}
                    <span className="font-medium">Address:</span>
                    <div className="text-left sm:text-right leading-relaxed"> {/* Align text right on larger screens */}
                      <span>{order.shipping_address_line},</span><br/>
                      <span>{order.shipping_city}, {order.shipping_province}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center"> {/* Responsive flex */}
                    <span className="font-medium">Total:</span>
                    <span>Rs{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center"> {/* Responsive flex */}
                    <span className="font-medium">Payment Method:</span>
                    <span className="flex items-center gap-1">
                      {getPaymentMethodIcon(order.payment_method)}
                      {order.payment_method}
                    </span>
                  </div>
                  
                  {/* Display Ordered Items */}
                  {order.items_json && order.items_json.length > 0 && (
                    <div className="space-y-1 mt-2 border-t pt-2">
                      <p className="font-semibold text-sm">Items Ordered:</p>
                      <div className="max-h-24 overflow-y-auto pr-2"> {/* Added scroll for long item lists */}
                        {order.items_json.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between text-sm text-muted-foreground flex-wrap"> {/* Allow wrapping */}
                            <span className="flex-1 min-w-0"> {/* Ensure text can shrink */}
                              {item.name}
                              {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                                <span className="ml-1 block sm:inline"> {/* Block on mobile, inline on larger */}
                                  ({Object.entries(item.selectedAttributes).map(([key, value]) => `${key}: ${value}`).join(', ')})
                                </span>
                              )}
                            </span>
                            <span className="flex-shrink-0">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t"> {/* Responsive flex */}
                    <span className="font-medium">Status:</span>
                    <Select
                      value={order.status}
                      onValueChange={(newStatus: Order['status']) => handleUpdateOrderStatus(order.id, newStatus)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-full sm:w-[140px] font-medium mt-2 sm:mt-0"> {/* Responsive width */}
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center"> {/* Responsive flex */}
                    <span className="font-medium">Date:</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4"> {/* Responsive flex for buttons */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 font-semibold"
                      onClick={() => handlePrintInvoice(order, profile)}
                      disabled={!profile}
                    >
                      <Printer className="h-4 w-4 mr-2" /> Print Invoice
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1 font-semibold">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
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
        )}
      </main>
    </div>
  );
}