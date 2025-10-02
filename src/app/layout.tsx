import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionContextProvider } from "@/components/session-context-provider";
import { CartContextProvider } from "@/components/cart-context-provider";
import { AuthWrapper } from '@/components/auth-wrapper';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yaarsite.vercel.app'), // Set base URL for absolute URLs
  title: {
    default: "Yaarsite - Easy Store Builder",
    template: "%s | Yaarsite", // Suffix for dynamic titles
  },
  description: "Yaarsite helps you launch professional, beautiful websites in seconds. Easy, fast, and perfect for any e-commerce seller.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  authors: [{ name: "Hammad Ahmed Afridi" }],
  icons: {
    icon: "https://placehold.co/32x32/1e293b/cbd5e1?text=Ys", // Consider replacing with a proper favicon
  },
  openGraph: {
    title: "Yaarsite - Easy Store Builder",
    description: "Launch your store in seconds, manage products, and grow online with Yaarsite.",
    url: "https://yaarsite.vercel.app",
    siteName: "Yaarsite",
    images: [
      {
        url: "https://placehold.co/1200x630/1e293b/cbd5e1?text=Ys", // Replace with a proper OG image
        width: 1200,
        height: 630,
        alt: "Yaarsite - Easy Store Builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yaarsite - Easy Store Builder",
    description: "Launch your store in seconds, manage products, and grow online with Yaarsite.",
    images: ["https://placehold.co/1200x630/1e293b/cbd5e1?text=Ys"], // Replace with a proper Twitter image
  },
  verification: {
    google: "google72f769dc7b33038e.html", // Ensure this is correct for your Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <SessionContextProvider>
            <CartContextProvider>
              <AuthWrapper>
                {children}
              </AuthWrapper>
            </CartContextProvider>
          </SessionContextProvider>
          <Toaster richColors />
      </body>
    </html>
  );
}