/**
 * Утилиты для форматирования дат
 * Используются для избежания проблем с гидратацией (одинаковое форматирование на сервере и клиенте)
 */

/**
 * Форматирует дату в формат YYYY-MM-DD (одинаковый на сервере и клиенте)
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Форматирует дату в формат DD.MM.YYYY (для отображения)
 */
export function formatDateDisplay(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}.${month}.${year}`;
}

