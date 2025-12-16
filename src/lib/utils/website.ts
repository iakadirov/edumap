/**
 * Утилиты для работы с веб-сайтами
 */

/**
 * Нормализует URL веб-сайта
 * Если указан sayt.uz → https://sayt.uz
 * Если уже https://sayt.uz → оставляет как есть
 */
export function normalizeWebsite(website: string | null | undefined): string | null {
  if (!website || typeof website !== 'string') {
    return null;
  }

  const trimmed = website.trim();
  if (!trimmed) {
    return null;
  }

  // Если уже начинается с http:// или https://, возвращаем как есть
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Если начинается с www., добавляем https://
  if (trimmed.startsWith('www.')) {
    return 'https://' + trimmed;
  }

  // Для остальных случаев добавляем https://
  return 'https://' + trimmed;
}

/**
 * Форматирует URL для отображения
 * Всегда показывает с https://
 */
export function formatWebsiteForDisplay(website: string | null | undefined): string | null {
  const normalized = normalizeWebsite(website);
  return normalized;
}

