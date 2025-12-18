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

