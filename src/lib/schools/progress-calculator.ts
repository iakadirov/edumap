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

  // Специальная обработка для basic раздела
  if (section === 'basic') {
    // Для name проверяем, что хотя бы одно поле (name_uz или name_ru) заполнено
    let filledRequired = requiredFields.filter((field) => {
      // Для name_uz проверяем, что хотя бы одно название есть
      if (field === 'name_uz') {
        const hasName = (data.name_uz && data.name_uz.trim() !== '') || 
               (data.name_ru && data.name_ru.trim() !== '');
        return hasName;
      }
      const value = data[field];
      let isFilled: boolean;
      // Для чисел проверяем, что не null/undefined (0 - валидное значение для некоторых полей)
      if (typeof value === 'number') {
        // Для fee_monthly_min и fee_monthly_max 0 может быть валидным (бесплатная школа)
        // Но обычно это означает незаполненное поле, поэтому проверяем > 0
        if (field === 'fee_monthly_min' || field === 'fee_monthly_max') {
          isFilled = value !== null && value !== undefined && value >= 0;
        } else {
          isFilled = value !== null && value !== undefined;
        }
      } else if (typeof value === 'string') {
        // Для строк проверяем, что не пустая
        isFilled = value !== null && value !== undefined && value.trim() !== '';
      } else {
        // Для остальных типов (boolean, object, etc.)
        isFilled = value !== null && value !== undefined && value !== '';
      }
      return isFilled;
    }).length;

    const requiredProgress =
      requiredFields.length > 0
        ? (filledRequired / requiredFields.length) * 70
        : 0;

    // Считаем заполненные важные поля (вес 30%)
    const filledImportant = importantFields.filter((field) => {
      const value = data[field];
      if (typeof value === 'string') {
        return value !== null && value !== undefined && value.trim() !== '';
      }
      return value !== null && value !== undefined && value !== '';
    }).length;

    const importantProgress =
      importantFields.length > 0
        ? (filledImportant / importantFields.length) * 30
        : 0;

    const totalProgress = Math.round(requiredProgress + importantProgress);
    // #region agent log
    const logDataProgress = {
      location: 'progress-calculator.ts:171',
      message: 'Progress calculated',
      data: {
        section: section,
        requiredFieldsCount: requiredFields.length,
        filledRequired: filledRequired,
        requiredProgress: requiredProgress,
        importantFieldsCount: importantFields.length,
        filledImportant: filledImportant,
        importantProgress: importantProgress,
        totalProgress: totalProgress
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    };
    fetch('http://127.0.0.1:7242/ingest/fcd63747-9f96-4dfa-bdcd-f4eb869a2f67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataProgress)}).catch(()=>{});
    // #endregion
    return totalProgress;
  }

  // Для остальных разделов стандартная логика
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

