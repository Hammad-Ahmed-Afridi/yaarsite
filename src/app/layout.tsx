import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionContextProvider } from "@/components/session-context-provider";
import { CartContextProvider } from "@/components/cart-context-provider"; // Import CartContextProvider

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
  // Google Verification - Remember to replace this value
  verification: {
    google: "google72f769dc7b33038e.html",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon setup */}
        <link rel="icon" type="image/x-icon" href="https://placehold.co/32x32/1e293b/cbd5e1?text=Ys" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionContextProvider>
          <CartContextProvider> {/* Wrap with CartContextProvider */}
            {children}
          </CartContextProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
}