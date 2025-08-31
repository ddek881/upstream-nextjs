import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'api-stream.com',
      'i0.wp.com'
    ],
  },
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    NEXT_PUBLIC_QRIS_USERNAME: process.env.NEXT_PUBLIC_QRIS_USERNAME,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
      }
    }
    return config
  },
};

export default nextConfig;
