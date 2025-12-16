/**
 * Утилиты для работы с номерами телефонов
 * Формат: +998901234567 (только + и 12 цифр)
 */

/**
 * Нормализует номер телефона
 * Удаляет все пробелы, дефисы и другие символы, оставляет только + и цифры
 * Добавляет + если его нет, не добавляет 998 автоматически
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Удаляем все символы кроме + и цифр (убираем пробелы, дефисы и т.д.)
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned || cleaned.length === 0) {
    return null;
  }

  // Если нет + в начале, добавляем его
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }

  // Если есть +, возвращаем как есть (только цифры после +)
  return cleaned;
}

/**
 * Форматирует номер телефона для отображения: +99890 123 45 67
 * Работает с любым форматом, группирует цифры по 3-2-2-2
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return null;
  }

  // Извлекаем цифры после +
  const digits = normalized.replace('+', '');
  if (digits.length === 0) {
    return normalized;
  }

  // Форматируем: группируем по 3-2-2-2 (или меньше, если цифр меньше)
  // Например: +998901234567 -> +998 90 123 45 67
  if (digits.length >= 5) {
    // Первые 3 цифры, затем по 2
    const parts: string[] = [];
    parts.push(digits.substring(0, 3));
    for (let i = 3; i < digits.length; i += 2) {
      parts.push(digits.substring(i, i + 2));
    }
    return '+' + parts.join(' ');
  }

  // Если цифр меньше 5, просто добавляем пробелы каждые 2-3 цифры
  return normalized;
}

/**
 * Получает номер телефона для tel: ссылки (без пробелов)
 */
export function getPhoneForTel(phone: string | null | undefined): string | null {
  return normalizePhone(phone);
}

