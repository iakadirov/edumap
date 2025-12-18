/**
 * Утилиты для валидации форм в реальном времени
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Валидация email
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Noto\'g\'ri email formati',
    };
  }
  return null;
}

/**
 * Валидация телефона
 */
export function validatePhone(phone: string): ValidationError | null {
  if (!phone) return null;
  // Проверяем формат +998XXXXXXXXX (12 цифр после +)
  const phoneRegex = /^\+998\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return {
      field: 'phone',
      message: 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak',
    };
  }
  return null;
}

/**
 * Валидация URL
 */
export function validateUrl(url: string): ValidationError | null {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return {
      field: 'url',
      message: 'Noto\'g\'ri URL formati',
    };
  }
}

/**
 * Валидация обязательного поля
 */
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      field: fieldName,
      message: `${fieldName} to'ldirilishi shart`,
    };
  }
  return null;
}

/**
 * Валидация минимальной длины
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): ValidationError | null {
  if (!value) return null;
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} kamida ${minLength} belgidan iborat bo'lishi kerak`,
    };
  }
  return null;
}

/**
 * Валидация максимальной длины
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): ValidationError | null {
  if (!value) return null;
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} ko'pi bilan ${maxLength} belgidan iborat bo'lishi kerak`,
    };
  }
  return null;
}

/**
 * Валидация числа в диапазоне
 */
export function validateNumberRange(
  value: number | null | undefined,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null {
  if (value === null || value === undefined) return null;
  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName} ${min} va ${max} orasida bo'lishi kerak`,
    };
  }
  return null;
}

/**
 * Комбинированная валидация для формы
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, Array<(value: any) => ValidationError | null>>
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors.push(error);
        break; // Останавливаемся на первой ошибке для поля
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

