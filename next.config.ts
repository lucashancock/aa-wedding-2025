import type { NextConfig } from "next";
// @ts-check
import withPlaiceholder from "@plaiceholder/next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // domains: ["picsum.photos", "firebasestorage.googleapis.com"], // allow Firebase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default withPlaiceholder(nextConfig);
