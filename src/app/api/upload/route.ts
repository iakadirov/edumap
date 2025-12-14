import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getFileUrl, getTempPath } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth/middleware';

/**
 * API endpoint для загрузки файлов в Yandex Cloud Storage
 * 
 * POST /api/upload
 * 
 * Body (multipart/form-data):
 * - file: File
 * - type: 'logo' | 'gallery' | 'license' | 'document'
 * - organizationId?: number (для привязки к организации)
 * 
 * Response:
 * {
 *   key: string,      // Путь к файлу в storage
 *   url: string,      // Presigned URL для доступа к файлу
 *   size: number,     // Размер файла в байтах
 * }
 */

// Максимальный размер файла: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Разрешенные типы файлов для изображений (логотипы, обложки, галерея)
// Поддерживаем: PNG, JPG, JPEG, SVG, WebP, GIF, BMP, TIFF, ICO
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', // Некоторые браузеры отправляют image/jpg
  'image/png',
  'image/svg+xml', // SVG
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/x-ms-bmp',
  'image/pjpeg', // Альтернативный MIME для JPEG
  'image/x-png', // Альтернативный MIME для PNG
];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const user = await getCurrentUser();
    if (!user || !['super_admin', 'admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const organizationId = formData.get('organizationId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Проверка типа файла
    // Для SVG некоторые браузеры могут отправлять разные MIME типы, поэтому проверяем и по расширению
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isSvgByExtension = fileExtension === 'svg';
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type) || (isSvgByExtension && file.type.startsWith('image/'));
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type);

    if (!isImage && !isDocument) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: images (PNG, JPG, JPEG, SVG, WebP, GIF, BMP, TIFF, ICO) or documents (PDF, DOC, DOCX)' },
        { status: 400 }
      );
    }

    // Проверка соответствия типа файла и типа загрузки
    if ((type === 'logo' || type === 'gallery' || type === 'cover') && !isImage) {
      return NextResponse.json(
        { error: 'Logo, gallery and cover files must be images' },
        { status: 400 }
      );
    }

    if ((type === 'license' || type === 'document') && !isDocument) {
      return NextResponse.json(
        { error: 'License and document files must be documents' },
        { status: 400 }
      );
    }

    // Чтение файла
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Определение расширения файла
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';

    // Генерация пути к файлу
    let key: string;
    if (type === 'logo' && organizationId) {
      key = `logos/${organizationId}/logo.${extension}`;
    } else if (type === 'cover' && organizationId) {
      key = `covers/${organizationId}/cover.${extension}`;
    } else if (type === 'gallery' && organizationId) {
      // Для галереи используем timestamp для уникальности
      const timestamp = Date.now();
      key = `galleries/${organizationId}/image_${timestamp}.${extension}`;
    } else if (type === 'license' && organizationId) {
      key = `licenses/${organizationId}/license.${extension}`;
    } else if (type === 'document' && organizationId) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      key = `documents/${organizationId}/${sanitizedName}`;
    } else {
      // Временный файл
      const uploadId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      key = getTempPath(uploadId, file.name);
    }

    // Загрузка файла
    await uploadFile({
      key,
      file: buffer,
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedBy: user.id.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });

    // Получение URL для доступа к файлу
    const url = await getFileUrl(key, 3600); // URL действителен 1 час

    return NextResponse.json({
      key,
      url,
      size: file.size,
      contentType: file.type,
      originalName: file.name,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

