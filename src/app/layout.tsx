import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionContextProvider } from "@/components/session-context-provider";
import { CartContextProvider } from "@/components/cart-context-provider";
import { AuthWrapper } from '@/components/auth-wrapper';
import { Toaster } from 'sonner'; // Import Toaster
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider

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
  description: "Yaarsite helps you launch professional, beautiful websites in seconds. Easy, fast, and perfect for any e-commerce seller.",
  robots: "index, follow",
  authors: [{ name: "Hammad Ahmed Afridi" }],
  icons: {
    icon: "https://placehold.co/32x32/1e293b/cbd5e1?text=Ys",
  },
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light" 
          enableSystem
          disableTransitionOnChange
        >
          <SessionContextProvider>
            <CartContextProvider>
              <AuthWrapper>
                {children}
              </AuthWrapper>
            </CartContextProvider>
          </SessionContextProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}