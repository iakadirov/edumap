'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { isPresignedUrl, refreshImageUrl, isPresignedUrlExpired } from '@/lib/utils/image-url';

/**
 * Обертка над Next.js Image компонентом, которая автоматически
 * отключает оптимизацию для presigned URLs из Yandex Cloud Storage
 * и обновляет истекшие URLs
 * 
 * Это необходимо, потому что:
 * 1. Presigned URLs имеют ограниченное время жизни (обычно 1 час)
 * 2. Next.js Image Optimization делает запрос от сервера, а не от браузера
 * 3. Presigned URL может истечь между рендерингом и оптимизацией
 * 4. Сервер Next.js не может использовать presigned URL для загрузки изображения
 */
export function OptimizedImage({ src, ...props }: ImageProps) {
  const srcString = typeof src === 'string' ? src : '';
  const shouldDisableOptimization = isPresignedUrl(srcString) || 
    srcString.includes('storage.yandexcloud.net');
  
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const maxRetries = 2;

  // Обновляем src при изменении исходного src
  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
  }, [src]);

  // Проверяем и обновляем presigned URL, если он истек или скоро истечет
  useEffect(() => {
    if (!isPresignedUrl(srcString) || isRefreshing) {
      return;
    }

    // Проверяем, истек ли URL
    if (isPresignedUrlExpired(srcString)) {
      setIsRefreshing(true);
      refreshImageUrl(srcString)
        .then((newUrl) => {
          if (newUrl && newUrl !== srcString) {
            setCurrentSrc(newUrl);
          }
        })
        .catch((error) => {
          console.error('Failed to refresh expired image URL:', error);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  }, [srcString, isRefreshing]);

  // Обработчик ошибки загрузки изображения
  const handleError = async () => {
    // Если это presigned URL и мы еще не превысили лимит попыток
    if (isPresignedUrl(srcString) && retryCount < maxRetries && !isRefreshing) {
      setIsRefreshing(true);
      try {
        const newUrl = await refreshImageUrl(srcString);
        if (newUrl && newUrl !== srcString) {
          setCurrentSrc(newUrl);
          setRetryCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Failed to refresh image URL on error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <Image
      src={currentSrc}
      {...props}
      // Отключаем оптимизацию для presigned URLs
      unoptimized={shouldDisableOptimization || props.unoptimized}
      onError={handleError}
    />
  );
}
