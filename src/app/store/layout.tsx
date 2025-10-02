import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Discover Stores",
  description: "Explore various online stores created with Yaarsite. Find unique products and support local businesses.",
  openGraph: {
    title: "Discover Stores on Yaarsite",
    description: "Explore various online stores created with Yaarsite. Find unique products and support local businesses.",
    url: "https://yaarsite.vercel.app/store",
  },
  twitter: {
    title: "Discover Stores on Yaarsite",
    description: "Explore various online stores created with Yaarsite. Find unique products and support local businesses.",
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}