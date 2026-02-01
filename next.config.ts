import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for custom server with Socket.IO
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Optimize images for custom server
  images: {
    unoptimized: false,
  },

  // Ensure proper handling of API routes and static files
  compress: true,

  // Production-ready headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
