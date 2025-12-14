import { NextRequest, NextResponse } from 'next/server';
import { getFileUrl } from '@/lib/storage';

/**
 * API endpoint для обновления presigned URL изображений
 * 
 * POST /api/images/refresh
 * 
 * Body:
 * {
 *   key: string,  // Ключ файла в storage (например: "logos/123/logo.webp")
 * }
 * 
 * Response:
 * {
 *   url: string,  // Новый presigned URL
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    // Генерируем новый presigned URL с временем жизни 7 дней (604800 секунд)
    // Это достаточно долго, чтобы изображения не истекали слишком часто
    const url = await getFileUrl(key, 604800);

    return NextResponse.json({
      url,
    });
  } catch (error: any) {
    console.error('Refresh image URL error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh image URL' },
      { status: 500 }
    );
  }
}
