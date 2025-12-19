/**
 * Утилиты для работы с thumbnail версиями изображений
 */

/**
 * Генерирует путь к thumbnail версии изображения
 * 
 * @param originalKey - Оригинальный ключ файла (например: "logos/123/logo.webp")
 * @returns Ключ thumbnail версии (например: "logos/123/logo_thumb.webp")
 */
export function getThumbnailKey(originalKey: string): string {
  // Разделяем путь на части
  const parts = originalKey.split('/');
  const filename = parts[parts.length - 1];
  const directory = parts.slice(0, -1).join('/');
  
  // Извлекаем имя файла и расширение
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // Если нет расширения, просто добавляем _thumb
    return `${directory}/${filename}_thumb`;
  }
  
  const nameWithoutExt = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);
  
  // Создаем thumbnail путь
  return `${directory}/${nameWithoutExt}_thumb${extension}`;
}

/**
 * Извлекает оригинальный ключ из thumbnail ключа
 * 
 * @param thumbnailKey - Ключ thumbnail версии (например: "logos/123/logo_thumb.webp")
 * @returns Оригинальный ключ (например: "logos/123/logo.webp")
 */
export function getOriginalKeyFromThumbnail(thumbnailKey: string): string {
  return thumbnailKey.replace(/_thumb\./, '.');
}

/**
 * Проверяет, является ли ключ thumbnail версией
 * 
 * @param key - Ключ файла
 * @returns true, если это thumbnail версия
 */
export function isThumbnailKey(key: string): boolean {
  return key.includes('_thumb.');
}

/**
 * Размеры для thumbnail версий
 */
export const THUMBNAIL_SIZES = {
  logo: { width: 128, height: 128 }, // Для логотипов в карточках (64px display, 2x для retina)
  cover: { width: 640, height: 360 }, // Для баннеров в карточках (320px display, 2x для retina)
  gallery: { width: 400, height: 400 }, // Для галереи
} as const;

/**
 * Получает размеры thumbnail для типа изображения
 */
export function getThumbnailSize(type: 'logo' | 'cover' | 'gallery') {
  return THUMBNAIL_SIZES[type];
}

