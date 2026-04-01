import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.contentstack.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
