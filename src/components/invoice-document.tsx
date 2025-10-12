"use client";

import React from 'react';

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  selected_color?: string;
  selected_size_input?: string;
}

interface InvoiceOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_address_line: string;
  total_amount: number;
  status: string;
  items_json: InvoiceItem[];
  payment_method: string;
  created_at: string;
}

interface InvoiceDocumentProps {
  order: InvoiceOrder;
  storeProfile: {
    tenant_name: string | null;
    store_address_line: string | null;
    store_city: string | null;
    store_province: string | null;
    email: string | null;
    phone_number: string | null;
  } | null;
}

export const InvoiceDocument = React.forwardRef<HTMLDivElement, InvoiceDocumentProps>(
  ({ order, storeProfile }, ref) => {
    const subtotal = order.items_json.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = order.total_amount - subtotal;

    return (
      <div ref={ref} className="p-8 bg-white text-gray-900 max-w-3xl mx-auto print:p-0 print:m-0 print:shadow-none">
        <style jsx global>{`
          @media print {
            body > div:not(.print-only) {
              display: none;
            }
            .print-only {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
        <div className="print-only">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">INVOICE</h1>
              <p className="text-sm text-gray-600">Invoice ID: <span className="font-medium">{order.id.substring(0, 8)}</span></p>
              <p className="text-sm text-gray-600">Date: <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span></p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">{storeProfile?.tenant_name || "Your Store"}</h2>
              {storeProfile?.store_address_line && <p className="text-sm text-gray-600">{storeProfile.store_address_line}</p>}
              {(storeProfile?.store_city || storeProfile?.store_province) && (
                <p className="text-sm text-gray-600">
                  {storeProfile.store_city}{storeProfile.store_city && storeProfile.store_province ? ', ' : ''}{storeProfile.store_province}
                </p>
              )}
              {storeProfile?.email && <p className="text-sm text-gray-600">Email: {storeProfile.email}</p>}
              {storeProfile?.phone_number && <p className="text-sm text-gray-600">Phone: {storeProfile.phone_number}</p>}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
            <p className="text-base font-medium">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.customer_email}</p>
            <p className="text-sm text-gray-600">{order.customer_phone}</p>
            <p className="text-sm text-gray-600">
              {order.shipping_address_line}, {order.shipping_city}, {order.shipping_province}
            </p>
          </div>

          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Item</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">Qty</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items_json.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-4 text-left text-sm text-gray-800">
                      {item.name}
                      {item.selected_color && <span className="ml-1 text-gray-500">({item.selected_color})</span>}
                      {item.selected_size_input && <span className="ml-1 text-gray-500">[{item.selected_size_input}]</span>}
                    </td>
                    <td className="py-2 px-4 text-right text-sm text-gray-800">{item.quantity}</td>
                    <td className="py-2 px-4 text-right text-sm text-gray-800">Rs{item.price.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right text-sm text-gray-800">Rs{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-base text-gray-700">
                <span>Subtotal:</span>
                <span>Rs{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base text-gray-700">
                <span>Delivery Charge:</span>
                <span>Rs{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                <span>TOTAL:</span>
                <span>Rs{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Payment Method: <span className="font-medium">{order.payment_method}</span></p>
            <p className="mt-4">Thank you for your business!</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceDocument.displayName = 'InvoiceDocument';