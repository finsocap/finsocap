import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const isProd = process.env.NODE_ENV === "production";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd && isStaticExport ? "/finsocap" : "");

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: isStaticExport,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
