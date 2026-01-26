import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Разрешить большие файлы для загрузки
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Редиректы для обратной совместимости
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/gasanov",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/gasanov/:path*",
        permanent: true,
      },
    ];
  },
  // Разрешить изображения из uploads
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      // Добавьте ваш домен здесь после настройки
      // {
      //   protocol: "https",
      //   hostname: "ваш-домен.ru",
      // },
      // Для разработки - можно использовать IP
      {
        protocol: "http",
        hostname: "130.49.150.220",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
