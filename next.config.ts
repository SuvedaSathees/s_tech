import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  images: { formats: ["image/avif", "image/webp"] },
  // Long-cache hero footage + 3D assets
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
