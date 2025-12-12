import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация производительности
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Компрессия
  compress: true,
  // Оптимизация изображений
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
