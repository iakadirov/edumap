/**
 * Утилиты для обработки изображений (создание thumbnail версий)
 */

import sharp from 'sharp';
import { getThumbnailKey, getThumbnailSize } from '@/lib/utils/image-thumbnail';
import { uploadFile, type UploadFileOptions } from './yandex-client';

/**
 * Создает thumbnail версию изображения и загружает её в storage
 * 
 * @param originalBuffer - Буфер оригинального изображения
 * @param originalKey - Ключ оригинального файла
 * @param type - Тип изображения (logo, cover, gallery)
 * @returns Ключ thumbnail версии
 */
export async function createAndUploadThumbnail(
  originalBuffer: Buffer,
  originalKey: string,
  type: 'logo' | 'cover' | 'gallery'
): Promise<string> {
  try {
    // Получаем размеры для thumbnail
    const { width, height } = getThumbnailSize(type);
    
    // Создаем thumbnail с помощью sharp
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(width, height, {
        fit: 'cover', // Обрезаем изображение, чтобы заполнить размеры
        position: 'center', // Центрируем при обрезке
      })
      .webp({ quality: 85 }) // Конвертируем в WebP для лучшего сжатия
      .toBuffer();
    
    // Генерируем ключ для thumbnail
    const thumbnailKey = getThumbnailKey(originalKey);
    
    // Загружаем thumbnail в storage
    await uploadFile({
      key: thumbnailKey,
      file: thumbnailBuffer,
      contentType: 'image/webp',
      metadata: {
        isThumbnail: 'true',
        originalKey,
        thumbnailType: type,
      },
    });
    
    return thumbnailKey;
  } catch (error) {
    console.error('Failed to create thumbnail:', error);
    throw error;
  }
}

/**
 * Создает thumbnail версию изображения из файла
 * 
 * @param file - Файл изображения
 * @param originalKey - Ключ оригинального файла
 * @param type - Тип изображения
 * @returns Ключ thumbnail версии
 */
export async function createThumbnailFromFile(
  file: File,
  originalKey: string,
  type: 'logo' | 'cover' | 'gallery'
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return createAndUploadThumbnail(buffer, originalKey, type);
}

