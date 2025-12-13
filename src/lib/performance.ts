/**
 * Утилиты для мониторинга производительности
 * 
 * Использование:
 * - Логирование медленных запросов
 * - Отслеживание Web Vitals (опционально)
 */

/**
 * Логирование медленного запроса
 */
export function logSlowQuery(
  queryName: string,
  duration: number,
  threshold: number = 1000 // 1 секунда по умолчанию
) {
  if (duration > threshold) {
    console.warn(`[Performance] Slow query detected: ${queryName} took ${duration}ms (threshold: ${threshold}ms)`);
  }
}

/**
 * Обертка для измерения времени выполнения функции
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  threshold?: number
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    if (threshold !== undefined) {
      logSlowQuery(name, duration, threshold);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] Error in ${name} after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Обертка для синхронных функций
 */
export function measurePerformanceSync<T>(
  name: string,
  fn: () => T,
  threshold?: number
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    if (threshold !== undefined) {
      logSlowQuery(name, duration, threshold);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] Error in ${name} after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Web Vitals tracking (опционально)
 * Можно интегрировать с аналитикой (Google Analytics, Vercel Analytics и т.д.)
 */
export function reportWebVital(metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}) {
  // В production можно отправлять в аналитику
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value, 'ms');
  }

  // Пример интеграции с Vercel Analytics (если используется):
  // if (typeof window !== 'undefined' && (window as any).va) {
  //   (window as any).va('web-vital', metric);
  // }
}

