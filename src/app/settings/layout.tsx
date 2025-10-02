import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Store Customization",
  description: "Customize your Yaarsite store's appearance, content, and settings.",
  robots: {
    index: false, // Disallow indexing for authenticated page
    follow: false,
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}