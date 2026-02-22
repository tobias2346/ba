import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.tbcast.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.laliganacional.com.ar",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.bbva.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_ENTORNO: process.env.NEXT_PUBLIC_ENTORNO,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_DEV_URL: process.env.NEXT_PUBLIC_API_DEV_URL,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    GOOGLE_MAPS_BROWSER_KEY: process.env.GOOGLE_MAPS_BROWSER_KEY,
  },
};

export default nextConfig;
