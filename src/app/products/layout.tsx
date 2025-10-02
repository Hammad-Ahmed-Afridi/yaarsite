import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Manage Products",
  description: "Add, edit, and delete products for your Yaarsite store.",
  robots: {
    index: false, // Disallow indexing for authenticated page
    follow: false,
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}