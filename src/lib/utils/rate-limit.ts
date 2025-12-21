/**
 * Простой Rate Limiter для API endpoints
 * Использует in-memory storage (для production рекомендуется Redis)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage
const rateLimitStore = new Map<string, RateLimitEntry>();

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  // Максимальное количество запросов
  limit: number;
  // Временное окно в миллисекундах
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs?: number;
}

/**
 * Проверить rate limit
 * @param identifier - уникальный идентификатор (IP, user ID и т.д.)
 * @param config - конфигурация лимита
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let entry = rateLimitStore.get(key);

  // Если записи нет или окно истекло, создаем новую
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    };
  }

  // Увеличиваем счетчик
  entry.count++;

  // Проверяем лимит
  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    };
  }

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit конфигурации для разных endpoints
 */
export const RATE_LIMITS = {
  // API endpoints
  api: {
    limit: 100,
    windowMs: 60 * 1000, // 100 запросов в минуту
  },
  // Upload endpoints
  upload: {
    limit: 20,
    windowMs: 60 * 1000, // 20 загрузок в минуту
  },
  // Auth endpoints
  auth: {
    limit: 10,
    windowMs: 60 * 1000, // 10 попыток в минуту
  },
  // Search endpoints
  search: {
    limit: 30,
    windowMs: 60 * 1000, // 30 поисков в минуту
  },
  // Heavy operations
  heavy: {
    limit: 5,
    windowMs: 60 * 1000, // 5 тяжелых операций в минуту
  },
} as const;

/**
 * Получить IP из запроса
 */
export function getClientIP(request: Request): string {
  // Проверяем различные заголовки
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return '127.0.0.1';
}

/**
 * Создать идентификатор для rate limit
 */
export function createRateLimitKey(
  request: Request,
  prefix: string,
  userId?: string
): string {
  const ip = getClientIP(request);

  // Если есть user ID, используем его (более точно)
  if (userId) {
    return `${prefix}:user:${userId}`;
  }

  return `${prefix}:ip:${ip}`;
}
