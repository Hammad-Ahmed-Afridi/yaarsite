"use client";

import React from 'react';
import Image from 'next/image';
import { Order } from '@/app/orders/page'; // Assuming Order type is exported from orders page
import { Profile } from '@/components/session-context-provider'; // Assuming Profile type is exported
import { format } from 'date-fns';

interface InvoiceDocumentProps {
  order: Order;
  storeProfile: Profile;
}

export function InvoiceDocument({ order, storeProfile }: InvoiceDocumentProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-gray-900 font-sans print:p-0 print:text-black">
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          /* Ensure text is black for printing */
          * {
            color: #000 !important;
          }
          /* Ensure backgrounds are printed */
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .bg-blue-50 {
            background-color: #eff6ff !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-300">
        <div>
          {storeProfile.avatar_url ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
              <Image
                src={storeProfile.avatar_url}
                alt="Store Logo"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-full"
              />
            </div>
          ) : (
            <h2 className="text-3xl font-bold text-primary">{storeProfile.tenant_name || "Your Store"}</h2>
          )}
          <h1 className="text-2xl font-bold mt-2">{storeProfile.tenant_name || "Your Store Name"}</h1>
          <p className="text-sm text-gray-600">{storeProfile.email}</p>
          {storeProfile.phone_number && <p className="text-sm text-gray-600">{storeProfile.phone_number}</p>}
          {storeProfile.store_address_line && (
            <p className="text-sm text-gray-600">
              {storeProfile.store_address_line}, {storeProfile.store_city}, {storeProfile.store_province}
            </p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-sm text-gray-600">Invoice #: {order.id.substring(0, 8)}</p>
          <p className="text-sm text-gray-600">Date: {format(new Date(order.created_at), 'PPP')}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-sm text-gray-600">{order.customer_email}</p>
          <p className="text-sm text-gray-600">{order.customer_phone}</p>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-semibold mb-2">Ship To:</h3>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-sm text-gray-600">{order.shipping_address_line}</p>
          <p className="text-sm text-gray-600">{order.shipping_city}, {order.shipping_province}</p>
        </div>
      </div>

      <div className="mb-8">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Item</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Qty</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Unit Price</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items_json.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.name}
                  {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                    <span className="block text-xs text-gray-500">
                      ({Object.entries(item.selectedAttributes).map(([key, value]) => `${key}: ${value}`).join(', ')})
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">{item.quantity}</td>
                <td className="px-4 py-2 text-right text-sm text-gray-800">Rs{item.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right text-sm text-gray-800">Rs{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>Rs{(order.total_amount - (storeProfile.delivery_charge || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Charge:</span>
            <span>Rs{(storeProfile.delivery_charge || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 border-gray-300">
            <span>Total:</span>
            <span>Rs{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 border-t pt-4 border-gray-300">
        <p>Payment Method: <span className="font-semibold">{order.payment_method}</span></p>
        <p className="mt-2">Thank you for your business!</p>
      </div>
    </div>
  );
}