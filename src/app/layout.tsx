import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionContextProvider, Profile } from "@/components/session-context-provider";
import { CartContextProvider } from "@/components/cart-context-provider";
import { Toaster } from 'sonner';
import { createSupabaseServerClient } from '@/integrations/supabase/server'; // Import server client
import { redirect } from 'next/navigation'; // Import redirect

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yaarsite - Easy Store Builder",
  description: "Yaarsite helps you launch professional, beautiful stores in seconds. Easy, fast, and perfect for any e-commerce seller.",
  robots: "index, follow",
  authors: [{ name: "Yaarsite" }],
  openGraph: {
    title: "Yaarsite - Easy Store Builder",
    description: "Launch your store in seconds, manage products, and grow online with Yaarsite.",
    url: "https://yaarsite.vercel.app",
    type: "website",
    images: [
      {
        url: "https://placehold.co/1200x630/1e293b/cbd5e1?text=Ys",
        width: 1200,
        height: 630,
        alt: "Yaarsite - Easy Store Builder",
      },
    ],
  },
  verification: {
    google: "google72f769dc7b33038e.html",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user || null;
  let profile: Profile | null = null;

  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("RootLayout: Error fetching profile:", error);
    } else {
      profile = data as Profile;
    }
  }

  // Define paths that are publicly accessible (no login required)
  const publicPaths = ['/login', '/signup', '/store', '/cart', '/checkout'];
  const currentPath = typeof window === 'undefined' ? '' : window.location.pathname; // This will be empty on server, handled by page.tsx

  // Server-side redirect logic for protected routes
  // This logic will be handled by individual pages for client-side navigation,
  // but for initial server render, we can redirect here if needed.
  // For now, we'll let individual pages handle their own auth checks and redirects
  // to avoid issues with dynamic paths like /store/[tenantSlug].

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="https://placehold.co/32x32/1e293b/cbd5e1?text=Ys" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionContextProvider initialSession={session} initialUser={user} initialProfile={profile}>
          <CartContextProvider>
            {children}
          </CartContextProvider>
        </SessionContextProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}