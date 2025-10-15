import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables - dynamic NEXTAUTH_URL for Vercel
  env: {
    NEXTAUTH_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
