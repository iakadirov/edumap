'use client';

import Image, { ImageProps } from 'next/image';
import { isPresignedUrl } from '@/lib/utils/image-url';

/**
 * Обертка над Next.js Image компонентом, которая автоматически
 * отключает оптимизацию для presigned URLs из Yandex Cloud Storage
 * 
 * Это необходимо, потому что:
 * 1. Presigned URLs имеют ограниченное время жизни
 * 2. Next.js Image Optimization делает запрос от сервера, а не от браузера
 * 3. Presigned URL может истечь между рендерингом и оптимизацией
 * 4. Сервер Next.js не может использовать presigned URL для загрузки изображения
 */
export function OptimizedImage({ src, ...props }: ImageProps) {
  // Проверяем, является ли URL presigned URL из Yandex Cloud Storage
  const srcString = typeof src === 'string' ? src : '';
  const shouldDisableOptimization = isPresignedUrl(srcString) || 
    srcString.includes('storage.yandexcloud.net');

  return (
    <Image
      src={src}
      {...props}
      // Отключаем оптимизацию для presigned URLs
      unoptimized={shouldDisableOptimization || props.unoptimized}
    />
  );
}
