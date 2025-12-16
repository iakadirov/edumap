'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Проверяем, является ли значение ключом файла в storage (не URL)
  const isStorageKey = srcString && 
    !srcString.startsWith('http://') && 
    !srcString.startsWith('https://') && 
    !srcString.startsWith('/') &&
    (srcString.includes('/') || srcString.includes('.'));

  const shouldDisableOptimization = isPresignedUrl(srcString) || 
    srcString.includes('storage.yandexcloud.net') ||
    isStorageKey;
  
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(isStorageKey);
  const fetchingRef = useRef<string | null>(null); // Отслеживаем, для какого ключа идет запрос
  const loadedKeyRef = useRef<string | null>(null); // Отслеживаем, для какого ключа уже загружен URL
  const maxRetries = 2;

  // Получаем presigned URL для ключа файла
  useEffect(() => {
    // Если это не ключ файла, просто устанавливаем src
    if (!isStorageKey) {
      setCurrentSrc(srcString || undefined);
      setRetryCount(0);
      setIsLoading(false);
      loadedKeyRef.current = null;
      fetchingRef.current = null;
      return;
    }

    // Если уже идет запрос для этого ключа, не запускаем новый
    if (fetchingRef.current === srcString) {
      return;
    }

    // Если URL уже загружен для этого ключа, не делаем запрос
    if (loadedKeyRef.current === srcString && currentSrc) {
      setIsLoading(false);
      return;
    }

    fetchingRef.current = srcString;
    setIsLoading(true);
    setIsRefreshing(true);
    
    fetch(`/api/storage/url?key=${encodeURIComponent(srcString)}&expires=3600`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to get presigned URL');
      })
      .then((data) => {
        if (data.url) {
          setCurrentSrc(data.url);
          loadedKeyRef.current = srcString; // Сохраняем, что для этого ключа URL загружен
        } else {
          setCurrentSrc(undefined);
          loadedKeyRef.current = null;
        }
      })
      .catch((error) => {
        console.error('Failed to get presigned URL for storage key:', error);
        setCurrentSrc(undefined);
        loadedKeyRef.current = null;
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
        fetchingRef.current = null;
      });
  }, [srcString, isStorageKey]); // Убрали isRefreshing и currentSrc из зависимостей

  // Проверяем и обновляем presigned URL, если он истек или скоро истечет
  useEffect(() => {
    // Пропускаем, если это ключ файла (для него уже есть отдельная логика)
    if (isStorageKey || !isPresignedUrl(srcString) || isRefreshing || fetchingRef.current) {
      return;
    }

    // Проверяем, истек ли URL
    if (isPresignedUrlExpired(srcString)) {
      fetchingRef.current = true;
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
          fetchingRef.current = false;
        });
    }
  }, [srcString, isStorageKey]); // Убрали isRefreshing из зависимостей

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

  // Если это ключ файла и URL еще не загружен, показываем placeholder или ничего
  if (isStorageKey && isLoading) {
    return (
      <div 
        className={props.className}
        style={{ 
          width: props.width || '100%', 
          height: props.height || '100%',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="text-gray-400 text-sm">Yuklanmoqda...</span>
      </div>
    );
  }

  // Если URL не загружен или невалидный, не рендерим изображение
  if (!currentSrc || (typeof currentSrc === 'string' && !currentSrc.startsWith('http') && !currentSrc.startsWith('/'))) {
    return null;
  }

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
