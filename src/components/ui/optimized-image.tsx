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
  
  // Инициализируем currentSrc для presigned URLs сразу
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(
    !isStorageKey && srcString && (srcString.startsWith('http') || srcString.startsWith('/')) 
      ? srcString 
      : undefined
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(isStorageKey);
  const fetchingKeyRef = useRef<string | null>(null); // Отслеживаем, для какого ключа идет запрос
  const fetchingPresignedRef = useRef<boolean>(false); // Флаг для presigned URL запросов
  const loadedKeyRef = useRef<string | null>(null); // Отслеживаем, для какого ключа уже загружен URL
  const maxRetries = 2;

  // Получаем presigned URL для ключа файла
  useEffect(() => {
    // Если это не ключ файла, просто устанавливаем src
    if (!isStorageKey) {
      // Для presigned URLs устанавливаем сразу, если URL валидный
      if (srcString && (srcString.startsWith('http') || srcString.startsWith('/'))) {
        setCurrentSrc(srcString);
      } else {
        setCurrentSrc(undefined);
      }
      setRetryCount(0);
      setIsLoading(false);
      loadedKeyRef.current = null;
      fetchingKeyRef.current = null;
      return;
    }

    // Если уже идет запрос для этого ключа, не запускаем новый
    if (fetchingKeyRef.current === srcString) {
      return;
    }

    // Если URL уже загружен для этого ключа, не делаем запрос
    if (loadedKeyRef.current === srcString && currentSrc) {
      setIsLoading(false);
      return;
    }
    
    fetchingKeyRef.current = srcString;
    setIsLoading(true);
    setIsRefreshing(true);
    
    fetch(`/api/storage/url?key=${encodeURIComponent(srcString)}&expires=3600`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        // Если файл не найден (404), это нормально - файл может не существовать
        // Не устанавливаем currentSrc, чтобы компонент вернул null
        if (response.status === 404) {
          console.warn(`File not found in storage: ${srcString}`);
          setCurrentSrc(undefined);
          loadedKeyRef.current = null;
          return null;
        }
        throw new Error(`Failed to get presigned URL: ${response.status}`);
      })
      .then((data) => {
        if (!data) {
          // 404 case - уже обработано выше
          return;
        }
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
        // Если это storage key и API вернул ошибку, оставляем currentSrc undefined
        // Компонент вернет null, и родительский компонент может показать placeholder
        setCurrentSrc(undefined);
        loadedKeyRef.current = null;
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
        fetchingKeyRef.current = null;
      });
  }, [srcString, isStorageKey]); // Убрали isRefreshing и currentSrc из зависимостей

  // Проверяем и обновляем presigned URL, если он истек или скоро истечет
  useEffect(() => {
    // Пропускаем, если это ключ файла (для него уже есть отдельная логика)
    if (isStorageKey || !isPresignedUrl(srcString) || isRefreshing || fetchingPresignedRef.current) {
      return;
    }

    // Проверяем, истек ли URL
    if (isPresignedUrlExpired(srcString)) {
      fetchingPresignedRef.current = true;
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
          fetchingPresignedRef.current = false;
        });
    }
  }, [srcString, isStorageKey]); // Убрали isRefreshing из зависимостей

  // Обработчик ошибки загрузки изображения
  const handleError = async () => {
    
    // Если это thumbnail и он не загрузился, пытаемся получить оригинальный файл
    if (srcString.includes('_thumb.')) {
      // Извлекаем оригинальный ключ из thumbnail URL
      try {
        const { extractKeyFromPresignedUrl } = await import('@/lib/utils/image-url');
        const { getOriginalKeyFromThumbnail } = await import('@/lib/utils/image-thumbnail');
        
        let originalKey: string | null = null;
        if (isPresignedUrl(srcString)) {
          const thumbnailKey = extractKeyFromPresignedUrl(srcString);
          if (thumbnailKey) {
            originalKey = getOriginalKeyFromThumbnail(thumbnailKey);
          }
        } else if (srcString.includes('/')) {
          // Если это уже ключ
          originalKey = getOriginalKeyFromThumbnail(srcString);
        }
        
        if (originalKey) {
          // Получаем presigned URL для оригинального файла
          const response = await fetch(`/api/storage/url?key=${encodeURIComponent(originalKey)}&expires=3600`);
          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              setCurrentSrc(data.url);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Failed to get original file:', error);
      }
    }
    
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
