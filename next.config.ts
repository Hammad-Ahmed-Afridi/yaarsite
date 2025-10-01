import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Removed @dyad-sh/nextjs-webpack-component-tagger
    return config;
  },
  images: {
    domains: ['vpfrtytxeimezwxhhtuf.supabase.co'], // Allow images from your Supabase storage
  },
};

export default nextConfig;