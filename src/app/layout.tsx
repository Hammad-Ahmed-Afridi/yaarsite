import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionContextProvider } from "@/components/session-context-provider";
import { CartContextProvider } from "@/components/cart-context-provider";
import { AuthWrapper } from '@/components/auth-wrapper';
import { Toaster } from 'sonner'; // Import Toaster
import { InactivityWarningBanner } from "@/components/inactivity-warning-banner"; // Import InactivityWarningBanner


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yaarsite - Build Your Store In Seconds",
  description: "Yaarsite is the fastest AI-powered e-commerce store builder. Launch professional, beautiful online stores in seconds, effortlessly. Perfect for any e-commerce seller seeking speed and simplicity.",
  keywords: [
    "e-commerce", "online store builder", "AI e-commerce", "speedy store builder", "fast e-commerce",
    "AI-powered", "no-code e-commerce", "small business e-commerce", "startup store", "entrepreneur tools",
    "digital storefront", "sell online", "product management", "order management", "customizable store",
    "mobile commerce", "m-commerce", "social commerce", "dropshipping", "online payments", "sales analytics",
    "quick launch", "scalable e-commerce", "affordable e-commerce", "instant store", "generative AI",
    "AI solutions for business", "direct-to-consumer", "DTC", "omnichannel commerce", "personalized shopping",
    "user-friendly e-commerce", "easy setup", "global selling", "digital business", "creator economy",
    "solopreneur", "e-shop", "intelligent store builder", "automated store", "smart e-commerce",
    "digital transformation", "machine learning", "AI tools", "AI solutions", "inventory management",
    "order fulfillment", "marketing tools", "SEO optimization", "custom domains", "branding",
    "payment gateways", "secure transactions", "customer support", "cost-effective", "future of e-commerce",
    "LLM ranking", "AI content generation", "e-commerce AI", "AI store optimization", "AI marketing" // Added LLM-focused keywords
  ],
  robots: "index, follow",
  authors: [{ name: "Hammad Ahmed Afridi" }],
  icons: {
    icon: "https://placehold.co/32x32/ffffff/29A399?text=Ys",
  },
  openGraph: {
    title: "Yaarsite - Build Your Store In Seconds",
    description: "Yaarsite is the fastest AI-powered e-commerce store builder. Launch professional, beautiful online stores in seconds, effortlessly. Perfect for any e-commerce seller seeking speed and simplicity.",
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
    <html lang="en" suppressHydrationWarning className="w-full overflow-x-hidden">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* You might want to add more specific icons for different platforms here */}
        {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> */}
        {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="default" /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
          <SessionContextProvider>
            <CartContextProvider>
              <AuthWrapper>
                <InactivityWarningBanner />
                {children}
              </AuthWrapper>
            </CartContextProvider>
          </SessionContextProvider>
          <Toaster richColors />
      </body>
    </html>
  );
}