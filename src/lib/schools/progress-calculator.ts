/**
 * Утилиты для расчета прогресса заполнения разделов школы
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

export interface SectionFields {
  [key: string]: any;
}

/**
 * Обязательные поля для каждого раздела
 */
const REQUIRED_FIELDS: Record<Section, string[]> = {
  basic: [
    // Хотя бы одно название должно быть (проверяется отдельно)
    'name_uz',
    'school_type',
    'description',
    'phone',
    'email',
    'region_id',
    'district_id',
    'address',
    'grade_from',
    'grade_to',
    'primary_language',
    'fee_monthly_min',
    'fee_monthly_max',
  ],
  education: [
    'curriculum',
    'primary_language',
  ],
  teachers: [
    'total_teachers',
  ],
  infrastructure: [],
  services: [],
  results: [],
  admission: [],
  finance: [],
  documents: [],
  photos: [],
  videos: [],
};

/**
 * Важные (необязательные) поля для каждого раздела
 */
const IMPORTANT_FIELDS: Record<Section, string[]> = {
  basic: [
    'name_ru',
    'short_description',
    'logo_url',
    'website',
    'telegram',
    'city',
    'landmark',
    'lat',
    'lng',
  ],
  education: [
    'accreditations',
    'languages_taught',
    'foreign_languages',
    'extracurricular_activities',
  ],
  teachers: [
    'avg_experience_years',
    'students_per_teacher',
    'percent_with_higher_education',
    'percent_with_pedagogical_education',
    'percent_with_masters',
    'percent_with_phd',
  ],
  infrastructure: [
    'has_library',
    'has_computer_labs',
    'has_sports_facilities',
    'has_cafeteria',
  ],
  services: [
    'has_transport',
    'has_meals',
    'has_extended_day',
  ],
  results: [
    'total_graduates',
    'graduates_to_universities',
    'avg_ielts_score',
  ],
  admission: [
    'admission_requirements',
    'admission_process',
  ],
  finance: [
    'has_scholarships',
    'has_discounts',
  ],
  documents: [
    'license_number',
    'license_date',
    'is_accredited',
  ],
  photos: ['photo_count'],
  videos: ['video_count'],
};

/**
 * Рассчитать прогресс заполнения раздела
 */
export function calculateSectionProgress(
  section: Section,
  data: SectionFields
): number {
  const requiredFields = REQUIRED_FIELDS[section] || [];
  const importantFields = IMPORTANT_FIELDS[section] || [];

  // Считаем заполненные обязательные поля (вес 70%)
  const filledRequired = requiredFields.filter((field) => {
    const value = data[field];
    return value !== null && value !== undefined && value !== '';
  }).length;

  const requiredProgress =
    requiredFields.length > 0
      ? (filledRequired / requiredFields.length) * 70
      : 0;

  // Считаем заполненные важные поля (вес 30%)
  const filledImportant = importantFields.filter((field) => {
    const value = data[field];
    return value !== null && value !== undefined && value !== '';
  }).length;

  const importantProgress =
    importantFields.length > 0
      ? (filledImportant / importantFields.length) * 30
      : 0;

  return Math.round(requiredProgress + importantProgress);
}

/**
 * Рассчитать общий прогресс заполнения профиля школы
 */
export function calculateOverallProgress(
  sectionsProgress: Record<Section, number>
): number {
  const sections = Object.keys(sectionsProgress) as Section[];
  if (sections.length === 0) return 0;

  const total = sections.reduce(
    (sum, section) => sum + (sectionsProgress[section] || 0),
    0
  );

  return Math.round(total / sections.length);
}

/**
 * Получить список незаполненных обязательных полей
 */
export function getMissingRequiredFields(
  section: Section,
  data: SectionFields
): string[] {
  const requiredFields = REQUIRED_FIELDS[section] || [];
  return requiredFields.filter((field) => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });
}

/**
 * Получить список незаполненных важных полей
 */
export function getMissingImportantFields(
  section: Section,
  data: SectionFields
): string[] {
  const importantFields = IMPORTANT_FIELDS[section] || [];
  return importantFields.filter((field) => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });
}

