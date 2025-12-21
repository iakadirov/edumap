/**
 * Валидаторы для разделов профиля школы
 */

export type Section =
  | 'basic'
  | 'education'
  | 'teachers'
  | 'infrastructure'
  | 'services'
  | 'results'
  | 'admission'
  | 'finance'
  | 'documents'
  | 'photos'
  | 'videos';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface BasicSectionData {
  name_uz?: string;
  name_ru?: string;
  school_type?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  grade_from?: number;
  grade_to?: number;
  fee_monthly_min?: number | null;
  fee_monthly_max?: number | null;
}

/**
 * Валидация базовой информации
 */
export function validateBasicSection(data: BasicSectionData): ValidationResult {
  const errors: ValidationError[] = [];

  // Название (обязательно name_uz)
  if (!data.name_uz) {
    errors.push({
      field: 'name',
      message: 'Maktab nomi kiritilishi kerak',
    });
  }

  // Тип школы
  if (!data.school_type || !['private', 'state', 'international'].includes(data.school_type)) {
    errors.push({
      field: 'school_type',
      message: 'Maktab turi tanlanishi kerak',
    });
  }

  // Описание (опционально, без требований к длине)

  // Телефон
  if (!data.phone) {
    errors.push({
      field: 'phone',
      message: 'Telefon raqami kiritilishi kerak',
    });
  } else if (!/^\+998\d{9}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push({
      field: 'phone',
      message: 'Telefon raqami noto\'g\'ri formatda (masalan: +998901234567)',
    });
  }

  // Email (опционально, но если указан - должен быть валидным)
  if (data.email && data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({
      field: 'email',
      message: 'Email noto\'g\'ri formatda',
    });
  }

  // Адрес
  if (!data.address) {
    errors.push({
      field: 'address',
      message: 'Manzil kiritilishi kerak',
    });
  }

  // Координаты
  if (!data.lat || !data.lng) {
    errors.push({
      field: 'coordinates',
      message: 'Karta orqali joylashuvni belgilash kerak',
    });
  }

  // Классы (опционально, но если указаны - проверяем логику)
  if (
    data.grade_from !== undefined &&
    data.grade_from !== null &&
    data.grade_to !== undefined &&
    data.grade_to !== null &&
    data.grade_from > data.grade_to
  ) {
    errors.push({
      field: 'grades',
      message: 'Boshlang\'ich sinf yakuniy sinfdan kichik bo\'lishi kerak',
    });
  }

  // Цены (опционально, но если указаны - проверяем логику)
  if (
    data.fee_monthly_min !== undefined &&
    data.fee_monthly_min !== null &&
    data.fee_monthly_max !== undefined &&
    data.fee_monthly_max !== null &&
    data.fee_monthly_min > data.fee_monthly_max
  ) {
    errors.push({
      field: 'fees',
      message: 'Minimal to\'lov maksimaldan kichik bo\'lishi kerak',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

interface EducationSectionData {
  curriculum?: string[];
  primary_language?: string;
}

/**
 * Валидация образовательной программы
 */
export function validateEducationSection(data: EducationSectionData): ValidationResult {
  const errors: ValidationError[] = [];

  // Учебная программа
  if (!data.curriculum || data.curriculum.length === 0) {
    errors.push({
      field: 'curriculum',
      message: 'Kamida bitta o\'quv dasturi tanlanishi kerak',
    });
  }

  // Основной язык обучения
  if (!data.primary_language) {
    errors.push({
      field: 'primary_language',
      message: 'Asosiy til tanlanishi kerak',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

interface TeachersSectionData {
  total_teachers?: number;
  avg_experience_years?: number;
  percent_with_higher_education?: number;
  percent_with_pedagogical_education?: number;
  percent_with_masters?: number;
  percent_with_phd?: number;
  students_per_teacher?: number;
  has_pd_program?: boolean;
  staff?: unknown[];
  [key: string]: number | boolean | unknown[] | undefined;
}

/**
 * Валидация педагогического состава
 */
export function validateTeachersSection(data: TeachersSectionData): ValidationResult {
  const errors: ValidationError[] = [];

  // Количество учителей
  if (data.total_teachers !== undefined && data.total_teachers < 1) {
    errors.push({
      field: 'total_teachers',
      message: 'O\'qituvchilar soni 1 dan katta bo\'lishi kerak',
    });
  }

  // Средний опыт
  if (data.avg_experience_years !== undefined && data.avg_experience_years < 0) {
    errors.push({
      field: 'avg_experience_years',
      message: 'O\'rtacha tajriba manfiy bo\'lishi mumkin emas',
    });
  }

  // Проценты должны быть от 0 до 100
  const percentFields = [
    'percent_with_higher_education',
    'percent_with_pedagogical_education',
    'percent_with_masters',
    'percent_with_phd',
  ];

  percentFields.forEach((field) => {
    const value = data[field];
    if (
      typeof value === 'number' &&
      (value < 0 || value > 100)
    ) {
      errors.push({
        field,
        message: `${field} 0 va 100 orasida bo\'lishi kerak`,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

interface ResultItem {
  year?: number;
  avg_ielts_score?: number | null;
  avg_sat_score?: number | null;
  total_graduates?: number;
  graduates_to_universities?: number;
}

interface ResultsSectionData {
  results?: ResultItem[];
}

/**
 * Валидация результатов
 */
export function validateResultsSection(data: ResultsSectionData): ValidationResult {
  const errors: ValidationError[] = [];

  // Если есть результаты за год, проверяем валидность
  if (data.results && Array.isArray(data.results)) {
    data.results.forEach((result: ResultItem, index: number) => {
      // Год
      if (!result.year || result.year < 2000 || result.year > 2100) {
        errors.push({
          field: `results[${index}].year`,
          message: 'Yil 2000 va 2100 orasida bo\'lishi kerak',
        });
      }

      // IELTS балл (0-9.0)
      if (
        result.avg_ielts_score !== undefined &&
        result.avg_ielts_score !== null &&
        (result.avg_ielts_score < 0 || result.avg_ielts_score > 9.0)
      ) {
        errors.push({
          field: `results[${index}].avg_ielts_score`,
          message: 'IELTS балл 0 va 9.0 orasida bo\'lishi kerak',
        });
      }

      // SAT балл (400-1600)
      if (
        result.avg_sat_score !== undefined &&
        result.avg_sat_score !== null &&
        (result.avg_sat_score < 400 || result.avg_sat_score > 1600)
      ) {
        errors.push({
          field: `results[${index}].avg_sat_score`,
          message: 'SAT балл 400 va 1600 orasida bo\'lishi kerak',
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

type SectionData = BasicSectionData | EducationSectionData | TeachersSectionData | ResultsSectionData;

/**
 * Основная функция валидации раздела
 */
export function validateSection(
  section: Section,
  data: SectionData
): ValidationResult {
  switch (section) {
    case 'basic':
      return validateBasicSection(data as BasicSectionData);
    case 'education':
      return validateEducationSection(data as EducationSectionData);
    case 'teachers':
      return validateTeachersSection(data as TeachersSectionData);
    case 'results':
      return validateResultsSection(data as ResultsSectionData);
    default:
      // Для остальных разделов нет строгой валидации
      return { valid: true, errors: [] };
  }
}

