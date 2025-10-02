import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your shopping cart items before proceeding to checkout.",
  robots: {
    index: false, // Disallow indexing for cart page
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}