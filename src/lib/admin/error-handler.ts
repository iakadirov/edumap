/**
 * Единая система обработки ошибок для админ-панели
 */

export interface AdminError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Преобразование технических ошибок в понятные сообщения
 */
export function parseError(error: unknown): AdminError {
  // Если это уже AdminError
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as AdminError;
  }

  // Если это строка
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN',
      message: error,
    };
  }

  // Если это объект ошибки
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // Supabase ошибки
    if (typeof err.code === 'string' && typeof err.message === 'string') {
      return {
        code: err.code,
        message: translateSupabaseError(err.code, err.message),
        details: err,
      };
    }

    // API ошибки
    if (typeof err.error === 'string') {
      return {
        code: 'API_ERROR',
        message: translateApiError(err.error),
        details: err,
      };
    }

    // Обычные ошибки
    if (typeof err.message === 'string') {
      return {
        code: 'ERROR',
        message: translateErrorMessage(err.message),
        details: err,
      };
    }
  }

  // Неизвестная ошибка
  return {
    code: 'UNKNOWN',
    message: 'Noma\'lum xatolik yuz berdi',
  };
}

/**
 * Перевод ошибок Supabase на узбекский язык
 */
function translateSupabaseError(code: string, message: string): string {
  const translations: Record<string, string> = {
    '23505': 'Bu ma\'lumot allaqachon mavjud',
    '23503': 'Bog\'liq ma\'lumot topilmadi',
    '23502': 'Majburiy maydon to\'ldirilmagan',
    '42501': 'Ruxsat yo\'q',
    'PGRST116': 'Ma\'lumot topilmadi',
    'PGRST301': 'Ma\'lumot topilmadi',
  };

  if (translations[code]) {
    return translations[code];
  }

  // Пытаемся извлечь понятное сообщение из английского текста
  if (message.includes('duplicate key')) {
    return 'Bu ma\'lumot allaqachon mavjud';
  }
  if (message.includes('foreign key')) {
    return 'Bog\'liq ma\'lumot topilmadi';
  }
  if (message.includes('not null')) {
    return 'Majburiy maydon to\'ldirilmagan';
  }
  if (message.includes('permission') || message.includes('policy')) {
    return 'Ruxsat yo\'q';
  }

  return message || 'Xatolik yuz berdi';
}

/**
 * Перевод ошибок API на узбекский язык
 */
function translateApiError(error: string): string {
  const translations: Record<string, string> = {
    'Unauthorized': 'Avtorizatsiya talab qilinadi',
    'Forbidden': 'Ruxsat yo\'q',
    'Not Found': 'Ma\'lumot topilmadi',
    'Bad Request': 'Noto\'g\'ri so\'rov',
    'Internal Server Error': 'Server xatosi',
    'Slug already exists': 'Bu slug allaqachon mavjud',
    'School not found': 'Maktab topilmadi',
    'Failed to update organization': 'Tashkilotni yangilashda xatolik',
    'Failed to create organization': 'Tashkilotni yaratishda xatolik',
    'Failed to update school details': 'Maktab ma\'lumotlarini yangilashda xatolik',
    'Failed to create school details': 'Maktab ma\'lumotlarini yaratishda xatolik',
  };

  return translations[error] || error;
}

/**
 * Перевод общих сообщений об ошибках
 */
function translateErrorMessage(message: string): string {
  const translations: Record<string, string> = {
    'Network request failed': 'Tarmoq xatosi',
    'Failed to fetch': 'Ma\'lumotlarni olishda xatolik',
    'Timeout': 'Vaqt tugadi',
  };

  // Проверяем точное совпадение
  if (translations[message]) {
    return translations[message];
  }

  // Проверяем частичное совпадение
  for (const [key, value] of Object.entries(translations)) {
    if (message.includes(key)) {
      return value;
    }
  }

  return message;
}

/**
 * Логирование ошибок
 */
export function logError(error: AdminError, context?: string) {
  console.error(`[Admin Error]${context ? ` [${context}]` : ''}`, {
    code: error.code,
    message: error.message,
    field: error.field,
    details: error.details,
  });

  // В production можно отправлять ошибки в сервис мониторинга
  // Например, Sentry, LogRocket и т.д.
}

/**
 * Обработка ошибки с логированием и возвратом понятного сообщения
 */
export function handleError(error: unknown, context?: string): string {
  const adminError = parseError(error);
  logError(adminError, context);
  return adminError.message;
}

