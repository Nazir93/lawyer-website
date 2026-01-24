import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Разрешить большие файлы для загрузки
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Разрешить изображения из uploads
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "130.49.150.220",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
