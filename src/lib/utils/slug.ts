/**
 * Утилита для генерации URL-friendly slug из текста
 */

export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
    .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
    .replace(/-+/g, '-') // Удаляем множественные дефисы
    .replace(/^-+|-+$/g, ''); // Удаляем дефисы в начале и конце
}

/**
 * Генерирует уникальный slug, добавляя суффикс если slug уже существует
 * @param baseSlug - Базовый slug
 * @param existingSlugs - Массив существующих slugs
 * @returns Уникальный slug
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!baseSlug) return '';
  
  const slugSet = new Set(existingSlugs.map(s => s.toLowerCase()));
  const baseSlugLower = baseSlug.toLowerCase();
  
  // Если базовый slug уникален, возвращаем его
  if (!slugSet.has(baseSlugLower)) {
    return baseSlug;
  }
  
  // Ищем уникальный slug с суффиксом
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (slugSet.has(uniqueSlug.toLowerCase())) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}

