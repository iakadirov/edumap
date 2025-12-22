/**
 * Вспомогательные функции для работы со школами
 * Устраняет дублирование кода
 */

import type { OrganizationRow } from '@/types/organization';

type Organization = OrganizationRow;

// Тип для school_details
type SchoolDetails = {
  id: string;
  organization_id: string;
  school_type: string;
  grade_from: number;
  grade_to: number;
  primary_language: string;
  accepts_preparatory: boolean;
  accepted_grades: number[] | null;
  additional_languages: string[] | null;
  curriculum: string[] | null;
  fee_monthly_min: number | null;
  fee_monthly_max: number | null;
  pricing_tiers: unknown | null;
  [key: string]: unknown;
};

export interface SchoolWithDetails extends Organization {
  school_details: SchoolDetails | SchoolDetails[] | null;
}

/**
 * Получить детали школы (нормализует массив к объекту)
 * Используется вместо повторяющегося паттерна:
 * const details = Array.isArray(school.school_details)
 *   ? school.school_details[0]
 *   : school.school_details;
 */
export function getSchoolDetails(school: SchoolWithDetails): SchoolDetails | null {
  if (!school.school_details) return null;
  return Array.isArray(school.school_details)
    ? school.school_details[0] ?? null
    : school.school_details;
}

/**
 * Получить минимальную цену школы
 */
export function getMinPrice(school: SchoolWithDetails): number | null {
  const details = getSchoolDetails(school);
  return details?.fee_monthly_min ?? null;
}

/**
 * Получить максимальную цену школы
 */
export function getMaxPrice(school: SchoolWithDetails): number | null {
  const details = getSchoolDetails(school);
  return details?.fee_monthly_max ?? null;
}

/**
 * Получить диапазон цен как строку
 */
export function getPriceRange(school: SchoolWithDetails): string | null {
  const min = getMinPrice(school);
  const max = getMaxPrice(school);

  if (!min && !max) return null;
  if (!min) return `${max?.toLocaleString('ru-RU')} so'm`;
  if (!max || min === max) return `${min.toLocaleString('ru-RU')} so'mdan`;

  return `${min.toLocaleString('ru-RU')} - ${max.toLocaleString('ru-RU')} so'm`;
}

/**
 * Получить тип школы
 */
export function getSchoolType(school: SchoolWithDetails): string | null {
  const details = getSchoolDetails(school);
  return details?.school_type ?? null;
}

/**
 * Получить основной язык обучения
 */
export function getPrimaryLanguage(school: SchoolWithDetails): string | null {
  const details = getSchoolDetails(school);
  return details?.primary_language ?? null;
}

/**
 * Получить все языки обучения
 */
export function getAllLanguages(school: SchoolWithDetails): string[] {
  const details = getSchoolDetails(school);
  if (!details) return [];

  const languages: string[] = [];
  if (details.primary_language) {
    languages.push(details.primary_language);
  }
  if (details.additional_languages) {
    languages.push(...details.additional_languages);
  }
  return languages;
}

/**
 * Получить учебные программы
 */
export function getCurriculum(school: SchoolWithDetails): string[] {
  const details = getSchoolDetails(school);
  if (!details?.curriculum) return [];
  return Array.isArray(details.curriculum) ? details.curriculum : [details.curriculum];
}

/**
 * Получить диапазон классов
 */
export function getGradeRange(school: SchoolWithDetails): { from: number; to: number } | null {
  const details = getSchoolDetails(school);
  if (!details) return null;

  return {
    from: details.grade_from ?? 1,
    to: details.grade_to ?? 11,
  };
}

/**
 * Получить диапазон классов как строку
 */
export function getGradeRangeString(school: SchoolWithDetails): string | null {
  const range = getGradeRange(school);
  if (!range) return null;

  const details = getSchoolDetails(school);
  const hasPreparatory = details?.accepts_preparatory;

  if (hasPreparatory) {
    return `0-${range.to} sinf`;
  }
  return `${range.from}-${range.to} sinf`;
}

/**
 * Проверить наличие услуги
 */
export function hasService(
  school: SchoolWithDetails,
  service: 'transport' | 'meals' | 'extended_day'
): boolean {
  const details = getSchoolDetails(school);
  if (!details) return false;

  switch (service) {
    case 'transport':
      return (details.has_transport as boolean | undefined) ?? false;
    case 'meals':
      return (details.has_meals as boolean | undefined) ?? false;
    case 'extended_day':
      return (details.has_extended_day as boolean | undefined) ?? false;
    default:
      return false;
  }
}

/**
 * Проверить соответствие фильтрам
 */
export function matchesFilters(
  school: SchoolWithDetails,
  filters: {
    school_type?: string;
    price_min?: number;
    price_max?: number;
    language?: string[];
    curriculum?: string[];
    grade?: string;
    has_transport?: boolean;
    has_meals?: boolean;
    has_extended_day?: boolean;
  }
): boolean {
  const details = getSchoolDetails(school);

  // School type
  if (filters.school_type && details?.school_type !== filters.school_type) {
    return false;
  }

  // Price range
  if (filters.price_min !== undefined || filters.price_max !== undefined) {
    const minPrice = details?.fee_monthly_min ?? 0;
    const maxPrice = details?.fee_monthly_max ?? 0;

    if (filters.price_min !== undefined && maxPrice < filters.price_min) {
      return false;
    }
    if (filters.price_max !== undefined && minPrice > filters.price_max) {
      return false;
    }
  }

  // Grade
  if (filters.grade) {
    if (filters.grade === '0') {
      if (!details?.accepts_preparatory) return false;
    } else {
      const gradeNum = parseInt(filters.grade, 10);
      if (!isNaN(gradeNum)) {
        const gradeFrom = details?.grade_from ?? 1;
        const gradeTo = details?.grade_to ?? 11;
        if (gradeNum < gradeFrom || gradeNum > gradeTo) return false;
      }
    }
  }

  // Language
  if (filters.language && filters.language.length > 0) {
    const allLanguages = getAllLanguages(school);
    const hasMatchingLanguage = filters.language.some((lang) =>
      allLanguages.includes(lang)
    );
    if (!hasMatchingLanguage) return false;
  }

  // Curriculum
  if (filters.curriculum && filters.curriculum.length > 0) {
    const schoolCurriculum = getCurriculum(school);
    const hasMatchingCurriculum = filters.curriculum.some((curr) =>
      schoolCurriculum.includes(curr)
    );
    if (!hasMatchingCurriculum) return false;
  }

  // Services
  if (filters.has_transport && !hasService(school, 'transport')) return false;
  if (filters.has_meals && !hasService(school, 'meals')) return false;
  if (filters.has_extended_day && !hasService(school, 'extended_day')) return false;

  return true;
}

/**
 * Маппинг для отображения типа школы
 */
export const SCHOOL_TYPE_LABELS: Record<string, string> = {
  private: 'Xususiy',
  state: 'Davlat',
  international: 'Xalqaro',
};

/**
 * Маппинг для отображения языков
 */
export const LANGUAGE_LABELS: Record<string, string> = {
  uzbek: "O'zbek",
  russian: 'Rus',
  english: 'Ingliz',
  kazakh: 'Qozoq',
  tajik: 'Tojik',
  karakalpak: "Qoraqalpoq",
};

/**
 * Маппинг для отображения учебных программ
 */
export const CURRICULUM_LABELS: Record<string, string> = {
  national: 'Milliy dastur',
  cambridge: 'Cambridge',
  ib: 'IB',
  american: 'Amerika',
  russian: 'Rossiya',
  mixed: 'Aralash',
};

/**
 * Получить отображаемое название типа школы
 */
export function getSchoolTypeLabel(school: SchoolWithDetails): string {
  const type = getSchoolType(school);
  return type ? SCHOOL_TYPE_LABELS[type] ?? type : '';
}

/**
 * Получить отображаемое название языка
 */
export function getLanguageLabel(language: string): string {
  return LANGUAGE_LABELS[language] ?? language;
}

/**
 * Получить отображаемое название программы
 */
export function getCurriculumLabel(curriculum: string): string {
  return CURRICULUM_LABELS[curriculum] ?? curriculum;
}
