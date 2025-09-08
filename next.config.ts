import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["picsum.photos", "firebasestorage.googleapis.com"], // allow Firebase Storage
  },
};

export default nextConfig;
