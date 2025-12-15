import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация производительности
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
    ],
    optimizeCss: true,
  },
  // Компрессия
  compress: true,
  // Оптимизация изображений
  // ВАЖНО: Для presigned URLs из Yandex Cloud Storage оптимизация отключена
  // через компонент OptimizedImage, так как:
  // 1. Presigned URLs имеют ограниченное время жизни (обычно 1 час)
  // 2. Next.js Image Optimization делает запрос от сервера, а не от браузера
  // 3. Presigned URL может истечь между рендерингом и оптимизацией
  // 4. Сервер Next.js не может использовать presigned URL для загрузки изображения
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
        pathname: '/**',
      },
      // Добавить другие домены для изображений, если нужно
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Headers для resource hints
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const headers: { key: string; value: string }[] = [];

    // Preconnect к Supabase
    if (supabaseUrl) {
      try {
        const url = new URL(supabaseUrl);
        headers.push({
          key: 'Link',
          value: `<${url.origin}>; rel=preconnect`,
        });
      } catch {
        // Игнорируем ошибки парсинга URL
      }
    }

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          ...headers,
        ],
      },
    ];
  },
};

export default nextConfig;
