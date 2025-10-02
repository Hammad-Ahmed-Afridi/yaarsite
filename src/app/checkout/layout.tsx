import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize your order and complete your purchase.",
  robots: {
    index: false, // Disallow indexing for checkout page
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}