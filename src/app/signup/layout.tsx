import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Yaarsite account and start building your online store.",
  robots: {
    index: false, // Disallow indexing for signup page
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}