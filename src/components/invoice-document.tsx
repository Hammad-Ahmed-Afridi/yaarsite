"use client";

import React from 'react';
import { format } from 'date-fns';
import { Profile } from '@/components/session-context-provider'; // Import Profile type

// Define the Order type here for use in this component
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
  items_json: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    selected_color?: string;
    selected_size_input?: string;
  }>;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface InvoiceDocumentProps {
  order: Order;
  storeProfile: Profile | null;
}

export const InvoiceDocument = React.forwardRef<HTMLDivElement, InvoiceDocumentProps>(
  ({ order, storeProfile }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black print:p-0 print:text-sm print:font-sans">
        <style type="text/css" media="print">
          {`
            @page { size: A4; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; }
            .invoice-header, .invoice-footer { background-color: #f0f0f0 !important; }
            .item-row td { border-bottom: 1px solid #eee; padding: 8px 0; }
          `}
        </style>
        <div className="max-w-3xl mx-auto">
          <div className="invoice-header flex justify-between items-center border-b pb-4 mb-6 bg-gray-100 p-4 rounded-t-lg">
            <div>
              <h1 className="text-3xl font-bold mb-1 print:text-xl">{storeProfile?.tenant_name || "Yaarsite Store"}</h1>
              {storeProfile?.store_address_line && <p className="text-sm print:text-xs">{storeProfile.store_address_line}</p>}
              {storeProfile?.store_city && storeProfile?.store_province && <p className="text-sm print:text-xs">{storeProfile.store_city}, {storeProfile.store_province}</p>}
              {storeProfile?.phone_number && <p className="text-sm print:text-xs">Phone: {storeProfile.phone_number}</p>}
              {storeProfile?.email && <p className="text-sm print:text-xs">Email: {storeProfile.email}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold text-primary print:text-lg">INVOICE</h2>
              <p className="text-sm print:text-xs">Order ID: <span className="font-mono">{order.id.substring(0, 8)}</span></p>
              <p className="text-sm print:text-xs">Date: {format(new Date(order.created_at), 'PPP')}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 print:text-base">Bill To:</h3>
            <p className="text-base print:text-sm">{order.customer_name}</p>
            <p className="text-base print:text-sm">{order.customer_email}</p>
            <p className="text-base print:text-sm">{order.customer_phone}</p>
            <p className="text-base print:text-sm">{order.shipping_address_line}, {order.shipping_city}, {order.shipping_province}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 print:text-base">Order Details:</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 font-semibold print:text-sm">Item</th>
                  <th className="py-2 font-semibold text-right print:text-sm">Qty</th>
                  <th className="py-2 font-semibold text-right print:text-sm">Price</th>
                  <th className="py-2 font-semibold text-right print:text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items_json.map((item, index) => (
                  <tr key={index} className="item-row">
                    <td className="py-2 print:text-sm">
                      {item.name}
                      {item.selected_color && <span className="ml-1 text-gray-600 print:text-xs">({item.selected_color})</span>}
                      {item.selected_size_input && <span className="ml-1 text-gray-600 print:text-xs">[{item.selected_size_input}]</span>}
                    </td>
                    <td className="py-2 text-right print:text-sm">{item.quantity}</td>
                    <td className="py-2 text-right print:text-sm">Rs{item.price.toFixed(2)}</td>
                    <td className="py-2 text-right print:text-sm">Rs{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-full max-w-xs space-y-1 text-right">
              <div className="flex justify-between text-base print:text-sm">
                <span>Subtotal:</span>
                <span>Rs{(order.total_amount - (storeProfile?.delivery_charge || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base print:text-sm">
                <span>Delivery Charge:</span>
                <span>Rs{(storeProfile?.delivery_charge || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2 print:text-base">
                <span>TOTAL:</span>
                <span>Rs{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 print:text-base">Payment Method:</h3>
            <p className="text-base print:text-sm">{order.payment_method}</p>
          </div>

          <div className="invoice-footer text-center text-sm text-gray-600 pt-4 border-t bg-gray-100 p-4 rounded-b-lg">
            <p className="print:text-xs">Thank you for your business!</p>
            <p className="print:text-xs">Powered by Yaarsite</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceDocument.displayName = 'InvoiceDocument';