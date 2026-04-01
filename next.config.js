const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid resolving the wrong workspace when multiple lockfiles exist on the machine (e.g. parent folder).
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.contentstack.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "eu-images.contentstack.com",
        pathname: "/**",
      },
      // Other regions (add as needed): e.g. azure-na-images.contentstack.io
      {
        protocol: "https",
        hostname: "**.contentstack.io",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
