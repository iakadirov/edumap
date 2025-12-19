/**
 * Утилиты для работы с URL изображений из Yandex Cloud Storage
 */

import { getThumbnailKey, isThumbnailKey } from './image-thumbnail';

/**
 * Извлекает ключ файла из presigned URL Yandex Cloud Storage
 * 
 * @param url - Presigned URL (например: "https://storage.yandexcloud.net/edumap/logos/123/logo.webp?X-Amz-...")
 * @returns Ключ файла (например: "logos/123/logo.webp") или null, если не удалось извлечь
 */
export function extractKeyFromPresignedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Извлекаем путь после bucket name
    // URL формат: https://storage.yandexcloud.net/bucket-name/key?params
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Первая часть - это bucket name, остальное - ключ
    if (pathParts.length < 2) {
      return null;
    }
    
    // Пропускаем bucket name и объединяем остальные части
    const key = pathParts.slice(1).join('/');
    return key;
  } catch {
    return null;
  }
}

/**
 * Проверяет, является ли URL presigned URL (содержит параметры X-Amz-*)
 */
export function isPresignedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.has('X-Amz-Algorithm') || urlObj.searchParams.has('X-Amz-Signature');
  } catch {
    return false;
  }
}

/**
 * Проверяет, истек ли presigned URL
 * 
 * @param url - Presigned URL
 * @returns true, если URL истек или скоро истечет (менее 5 минут до истечения)
 */
export function isPresignedUrlExpired(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get('X-Amz-Expires');
    const dateParam = urlObj.searchParams.get('X-Amz-Date');
    
    if (!expiresParam || !dateParam) {
      return false; // Не presigned URL или нет параметров времени
    }
    
    // X-Amz-Date в формате ISO8601: 20251215T074720Z
    const year = dateParam.substring(0, 4);
    const month = dateParam.substring(4, 6);
    const day = dateParam.substring(6, 8);
    const hour = dateParam.substring(9, 11);
    const minute = dateParam.substring(11, 13);
    const second = dateParam.substring(13, 15);
    
    const expirationDate = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
    );
    expirationDate.setSeconds(expirationDate.getSeconds() + parseInt(expiresParam, 10));
    
    // Проверяем, истек ли URL или истечет в течение 5 минут
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    return expirationDate <= fiveMinutesFromNow;
  } catch {
    return false;
  }
}

/**
 * Получает свежий presigned URL для изображения
 * 
 * @param urlOrKey - Старый presigned URL или ключ файла
 * @returns Новый presigned URL или исходный URL, если не удалось обновить
 */
export async function refreshImageUrl(urlOrKey: string): Promise<string> {
  try {
    // Извлекаем ключ из URL, если это presigned URL
    let key: string | null = null;
    
    if (isPresignedUrl(urlOrKey)) {
      key = extractKeyFromPresignedUrl(urlOrKey);
    } else {
      // Если это уже ключ, используем его напрямую
      key = urlOrKey;
    }
    
    if (!key) {
      // Если не удалось извлечь ключ, возвращаем исходный URL
      return urlOrKey;
    }
    
    // Запрашиваем новый presigned URL через API
    const response = await fetch('/api/images/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });
    
    if (!response.ok) {
      // Если запрос не удался, возвращаем исходный URL
      return urlOrKey;
    }
    
    const data = await response.json();
    return data.url || urlOrKey;
  } catch (error) {
    console.error('Failed to refresh image URL:', error);
    // В случае ошибки возвращаем исходный URL
    return urlOrKey;
  }
}

/**
 * Получает thumbnail URL из оригинального URL или ключа
 * 
 * @param originalUrlOrKey - Оригинальный URL или ключ файла
 * @param useThumbnail - Использовать ли thumbnail версию (по умолчанию true)
 * @returns URL thumbnail версии или оригинальный URL, если thumbnail недоступен
 */
export async function getThumbnailUrl(
  originalUrlOrKey: string,
  useThumbnail: boolean = true
): Promise<string> {
  if (!useThumbnail) {
    return originalUrlOrKey;
  }

  try {
    // Извлекаем ключ из URL, если это presigned URL
    let key: string | null = null;
    
    if (isPresignedUrl(originalUrlOrKey)) {
      key = extractKeyFromPresignedUrl(originalUrlOrKey);
    } else {
      // Если это уже ключ, используем его напрямую
      key = originalUrlOrKey;
    }
    
    if (!key) {
      // Если не удалось извлечь ключ, возвращаем исходный URL
      return originalUrlOrKey;
    }

    // Если это уже thumbnail, возвращаем как есть
    if (isThumbnailKey(key)) {
      return originalUrlOrKey;
    }

    // Генерируем ключ thumbnail версии
    const thumbnailKey = getThumbnailKey(key);
    
    // Запрашиваем presigned URL для thumbnail через API
    const response = await fetch(`/api/storage/url?key=${encodeURIComponent(thumbnailKey)}&expires=3600`);
    
    if (!response.ok) {
      // Если thumbnail не найден, возвращаем оригинальный URL
      return originalUrlOrKey;
    }
    
    const data = await response.json();
    return data.url || originalUrlOrKey;
  } catch (error) {
    console.error('Failed to get thumbnail URL:', error);
    // В случае ошибки возвращаем исходный URL
    return originalUrlOrKey;
  }
}
