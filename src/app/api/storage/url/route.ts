import { NextRequest, NextResponse } from 'next/server';
import { getFileUrl } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth/middleware';

/**
 * API endpoint для получения presigned URL файла по ключу
 * 
 * GET /api/storage/url?key=logos/123/logo.png&expires=3600
 * 
 * Response:
 * {
 *   url: string,  // Presigned URL
 *   key: string,  // Ключ файла
 * }
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const expires = parseInt(searchParams.get('expires') || '3600', 10);

    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    // Проверяем, что ключ валидный (начинается с разрешенных префиксов)
    // Это позволяет публичный доступ для изображений на публичных страницах
    // Также поддерживаем thumbnail версии (с _thumb в имени файла)
    const allowedPrefixes = ['logos/', 'covers/', 'galleries/', 'temp/', 'banners/'];
    const isValidKey = allowedPrefixes.some(prefix => key.startsWith(prefix));
    
    if (!isValidKey) {
      // Для невалидных ключей требуем авторизацию
      const user = await getCurrentUser();
      if (!user || !['super_admin', 'admin', 'moderator', 'school_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    // Для валидных ключей разрешаем публичный доступ (для изображений на публичных страницах)

    // Проверяем существование файла перед созданием presigned URL
    const { fileExists } = await import('@/lib/storage');
    const exists = await fileExists(key);
    
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found', key },
        { status: 404 }
      );
    }

    // Получаем presigned URL
    const url = await getFileUrl(key, expires);

    return NextResponse.json({
      url,
      key,
      expiresIn: expires,
    });
  } catch (error: any) {
    console.error('Error getting file URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get file URL' },
      { status: 500 }
    );
  }
}

