import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Manage Orders",
  description: "View and manage customer orders for your Yaarsite store.",
  robots: {
    index: false, // Disallow indexing for authenticated page
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}