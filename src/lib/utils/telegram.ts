/**
 * Нормализация Telegram username/URL
 * Поддерживает различные форматы:
 * - @maktabsalam
 * - https://t.me/maktabsalam
 * - https://t.me/@maktabsalam
 * - maktabsalam
 * 
 * Возвращает нормализованный username (без @) и полный URL
 */

export interface TelegramData {
  username: string; // без @, например: maktabsalam
  url: string; // https://t.me/maktabsalam
  display: string; // @maktabsalam для отображения
}

/**
 * Нормализует Telegram username/URL
 * @param input - Входная строка в любом формате
 * @returns Нормализованные данные или null если невалидный формат
 */
export function normalizeTelegram(input: string | null | undefined): TelegramData | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Убираем пробелы
  let cleaned = trimmed.replace(/\s+/g, '');

  // Паттерны для распознавания
  const patterns = [
    // https://t.me/@username или https://t.me/username
    /^https?:\/\/(?:www\.)?t\.me\/(?:@)?([a-zA-Z0-9_]+)/i,
    // @username
    /^@([a-zA-Z0-9_]+)/,
    // username (просто текст)
    /^([a-zA-Z0-9_]+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const username = match[1].toLowerCase();
      return {
        username,
        url: `https://t.me/${username}`,
        display: `@${username}`,
      };
    }
  }

  return null;
}

/**
 * Сохраняет Telegram в нормализованном виде (username без @)
 * @param input - Входная строка
 * @returns Нормализованный username или null
 */
export function saveTelegram(input: string | null | undefined): string | null {
  const normalized = normalizeTelegram(input);
  return normalized ? normalized.username : null;
}

/**
 * Форматирует Telegram для отображения
 * @param input - Сохраненный username или любой формат
 * @returns Объект с данными для отображения или null
 */
export function formatTelegramForDisplay(input: string | null | undefined): TelegramData | null {
  // Если это уже сохраненный username (без @), просто форматируем
  if (input && !input.startsWith('@') && !input.startsWith('http')) {
    const username = input.toLowerCase().replace(/^@/, '');
    if (/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        username,
        url: `https://t.me/${username}`,
        display: `@${username}`,
      };
    }
  }

  // Иначе нормализуем
  return normalizeTelegram(input);
}

