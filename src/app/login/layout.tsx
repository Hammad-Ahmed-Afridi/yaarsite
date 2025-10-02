import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Yaarsite account to manage your store.",
  robots: {
    index: false, // Disallow indexing for login page
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}