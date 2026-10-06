import type { NextConfig } from "next";

// Vercel deployment root configuration
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
