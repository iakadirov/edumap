/**
 * Сервис для работы с хранилищем файлов
 * Решает N+1 проблему с thumbnail URLs
 */

import { getFileUrl, fileExists } from '@/lib/storage/yandex-client';

interface ThumbnailUrls {
  logo?: string | null;
  cover?: string | null;
}

interface SchoolThumbnails {
  [schoolId: string]: ThumbnailUrls;
}

// Кэш thumbnail URLs (простой in-memory кэш)
const thumbnailCache = new Map<string, { url: string; expires: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 минут

/**
 * Получить thumbnail URL с кэшированием
 */
async function getCachedThumbnailUrl(key: string): Promise<string | null> {
  const cached = thumbnailCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.url;
  }

  try {
    // Пробуем получить thumbnail версию
    const thumbnailKey = key.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '_thumb.$1');
    const exists = await fileExists(thumbnailKey);

    const finalKey = exists ? thumbnailKey : key;
    const url = await getFileUrl(finalKey, 1800); // 30 минут

    thumbnailCache.set(key, { url, expires: Date.now() + CACHE_TTL });
    return url;
  } catch (error) {
    console.error(`Error getting thumbnail URL for ${key}:`, error);
    return null;
  }
}

/**
 * Извлечь ключ файла из URL (если это presigned URL)
 */
function extractKeyFromUrl(url: string | null): string | null {
  if (!url) return null;

  // Если это уже ключ (не URL)
  if (!url.startsWith('http')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    // Для Yandex Cloud Storage путь начинается с /bucket-name/
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      // Убираем имя bucket
      return pathParts.slice(1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

export class StorageService {
  /**
   * Batch получение thumbnail URLs для списка школ
   * Решает N+1 проблему
   */
  static async getBatchThumbnailUrls(
    schools: Array<{ id: string; logo_url: string | null; cover_image_url: string | null }>
  ): Promise<SchoolThumbnails> {
    const result: SchoolThumbnails = {};

    // Собираем все уникальные ключи
    const keysToFetch: Array<{ schoolId: string; type: 'logo' | 'cover'; key: string }> = [];

    for (const school of schools) {
      const logoKey = extractKeyFromUrl(school.logo_url);
      const coverKey = extractKeyFromUrl(school.cover_image_url);

      if (logoKey) {
        keysToFetch.push({ schoolId: school.id, type: 'logo', key: logoKey });
      }
      if (coverKey) {
        keysToFetch.push({ schoolId: school.id, type: 'cover', key: coverKey });
      }

      // Инициализируем результат
      result[school.id] = { logo: null, cover: null };
    }

    // Получаем URLs параллельно (с ограничением concurrency)
    const BATCH_SIZE = 10;
    for (let i = 0; i < keysToFetch.length; i += BATCH_SIZE) {
      const batch = keysToFetch.slice(i, i + BATCH_SIZE);
      const urls = await Promise.all(
        batch.map(({ key }) => getCachedThumbnailUrl(key))
      );

      batch.forEach((item, index) => {
        if (urls[index]) {
          result[item.schoolId][item.type] = urls[index];
        }
      });
    }

    return result;
  }

  /**
   * Получить thumbnail URL для одного изображения
   */
  static async getThumbnailUrl(url: string | null): Promise<string | null> {
    if (!url) return null;

    const key = extractKeyFromUrl(url);
    if (!key) return url; // Если не удалось извлечь ключ, вернем оригинальный URL

    return getCachedThumbnailUrl(key);
  }

  /**
   * Очистить кэш (для тестирования)
   */
  static clearCache(): void {
    thumbnailCache.clear();
  }
}
