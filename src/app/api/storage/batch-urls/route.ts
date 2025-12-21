import { NextRequest, NextResponse } from 'next/server';
import { getFileUrl, fileExists } from '@/lib/storage/yandex-client';
import { z } from 'zod';

/**
 * Batch API для получения presigned URLs
 * Решает N+1 проблему при загрузке списка школ
 *
 * POST /api/storage/batch-urls
 * Body: { keys: string[], preferThumbnails?: boolean }
 * Response: { urls: { [key: string]: string | null } }
 */

const requestSchema = z.object({
  keys: z.array(z.string().max(500)).max(50), // Максимум 50 ключей за раз
  preferThumbnails: z.boolean().optional().default(true),
});

// Простой кэш для URLs
const urlCache = new Map<string, { url: string; expires: number }>();
const CACHE_TTL = 25 * 60 * 1000; // 25 минут (меньше чем TTL presigned URL)

async function getCachedUrl(key: string, preferThumbnail: boolean): Promise<string | null> {
  const cacheKey = `${key}:${preferThumbnail}`;
  const cached = urlCache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.url;
  }

  try {
    let finalKey = key;

    // Пробуем получить thumbnail версию
    if (preferThumbnail) {
      const thumbnailKey = key.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '_thumb.$1');
      if (thumbnailKey !== key) {
        const exists = await fileExists(thumbnailKey);
        if (exists) {
          finalKey = thumbnailKey;
        }
      }
    }

    const url = await getFileUrl(finalKey, 1800); // 30 минут

    urlCache.set(cacheKey, { url, expires: Date.now() + CACHE_TTL });

    // Очистка старых записей
    if (urlCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of urlCache.entries()) {
        if (v.expires <= now) {
          urlCache.delete(k);
        }
      }
    }

    return url;
  } catch (error) {
    console.error(`Error getting URL for ${key}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { keys, preferThumbnails } = validation.data;

    // Получаем URLs параллельно с ограничением concurrency
    const BATCH_SIZE = 10;
    const urls: Record<string, string | null> = {};

    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((key) => getCachedUrl(key, preferThumbnails))
      );

      batch.forEach((key, index) => {
        urls[key] = results[index];
      });
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error in batch-urls:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
