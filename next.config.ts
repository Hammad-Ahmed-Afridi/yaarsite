import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Removed @dyad-sh/nextjs-webpack-component-tagger
    return config;
  },
  images: {
    domains: [
      'vpfrtytxeimezwxhhtuf.supabase.co', // Existing Supabase domain
      'res.cloudinary.com', // Added for landing page images
      'placehold.co' // Added for landing page placeholder images
    ], 
  },
};

export default nextConfig;