/**
 * Утилита для преобразования данных школы из базы данных в формат SchoolProfile
 */

import type { SchoolProfile } from '@/types/school';
import type { Database } from '@/types/database';

type Organization = Database['public']['Tables']['organizations']['Row'];
type SchoolDetails = Database['public']['Tables']['school_details']['Row'];

interface SchoolWithDetails extends Organization {
  school_details: SchoolDetails | SchoolDetails[] | null;
}

/**
 * Преобразует данные школы из базы данных в формат SchoolProfile
 */
export function transformSchoolToProfile(school: SchoolWithDetails): SchoolProfile {
  const details = Array.isArray(school.school_details)
    ? school.school_details[0]
    : school.school_details;
  
  // Конвертируем рейтинг из 0-100 в 0-5 для отображения
  const ratingScore = school.overall_rating ? school.overall_rating / 20 : 0;
  
  // Формируем список телефонов
  const phones: string[] = [];
  if (school.phone) phones.push(school.phone);
  if (school.phone_secondary) phones.push(school.phone_secondary);
  if (school.phone_admission) phones.push(school.phone_admission);
  
  // Формируем список языков
  const languages: string[] = [];
  if (details?.primary_language) {
    languages.push(
      details.primary_language === 'russian'
        ? 'Rus'
        : details.primary_language === 'english'
        ? 'Ingliz'
        : "O'zbek"
    );
  }
  if (details?.additional_languages) {
    details.additional_languages.forEach((lang) => {
      const label =
        lang === 'russian' ? 'Rus' : lang === 'english' ? 'Ingliz' : "O'zbek";
      if (!languages.includes(label)) {
        languages.push(label);
      }
    });
  }
  
  // Формируем список features
  const features: string[] = [];
  if (details?.has_transport) features.push('transport');
  if (details?.has_meals) features.push('meals');
  if (details?.has_extended_day) features.push('extendedDay');
  if (details?.has_swimming_pool) features.push('pool');
  if (details?.has_gym) features.push('gym');
  if (details?.has_library) features.push('library');
  if (details?.has_computer_lab) features.push('lab');
  
  // Формируем curriculum
  const curriculum = details?.curriculum || [];
  
  // Формируем контакты
  const contacts = {
    phones,
    email: school.email || '',
    website: school.website || undefined,
    telegram: school.telegram || undefined,
    instagram: school.instagram || undefined,
    facebook: school.facebook || undefined,
    whatsapp: school.phone_secondary || undefined,
  };
  
  // Формируем fee
  const fee = {
    min: details?.fee_monthly_min || 0,
    max: details?.fee_monthly_max || undefined,
    currency: 'UZS' as const,
    period: 'month' as const,
  };
  
  // Формируем stats
  const stats = {
    foundedYear: school.founded_year || undefined,
    studentsCount: details?.total_students || undefined,
    teachersCount: details?.total_teachers || undefined,
    studentTeacherRatio: details?.total_students && details?.total_teachers
      ? (details.total_students / details.total_teachers).toFixed(1)
      : undefined,
    classSize: details?.avg_class_size
      ? {
          min: Math.floor(details.avg_class_size * 0.8),
          max: Math.ceil(details.avg_class_size * 1.2),
        }
      : undefined,
  };
  
  // Формируем badges
  const badges = {
    isVerified: school.is_verified || false,
    isPremium: false,
    isNew: false,
    ranking: school.overall_rating && school.overall_rating >= 80
      ? { type: 'top10' as const, year: new Date().getFullYear() }
      : undefined,
    awards: [],
  };
  
  // Формируем location
  const location = {
    city: school.city || '',
    district: school.district || '',
    address: school.address || '',
    coordinates: {
      lat: school.lat || 0,
      lng: school.lng || 0,
    },
  };
  
  // Формируем grades
  const grades = {
    from: details?.accepts_preparatory ? 0 : details?.grade_from || 1,
    to: details?.grade_to || 11,
  };
  
  return {
    id: school.id,
    slug: school.slug,
    name: school.name,
    nameUz: school.name_uz || undefined,
    nameRu: school.name_ru || undefined,
    logo: school.logo_url || '',
    coverImage: school.cover_image_url || school.banner_url || '',
    description: school.description || '',
    shortDescription: school.short_description || undefined,
    type: (details?.school_type as 'private' | 'international' | 'state_enhanced') || 'private',
    curriculum,
    accreditations: details?.has_international_accreditation
      ? [details.accreditation_body || 'International']
      : [],
    location,
    grades,
    languages,
    isBilingual: languages.length > 1,
    rating: {
      score: ratingScore,
      reviewCount: school.reviews_count || 0,
      rank: undefined, // Можно вычислить позже
      breakdown: undefined, // Можно получить из отзывов
    },
    badges,
    fee,
    hasOpenEnrollment: false, // Можно добавить поле в БД
    enrollmentYear: undefined,
    contacts,
    stats,
    features,
    photos: [],
    videos: [],
    documents: details?.license_number
      ? [
          {
            name: 'Лицензия на образовательную деятельность',
            type: 'license' as const,
            issuer: details.license_authority || '',
            year: details.license_date
              ? new Date(details.license_date).getFullYear()
              : new Date().getFullYear(),
            url: '', // Можно добавить поле в БД
          },
        ]
      : [],
    reviews: [],
    photosCount: 0, // Можно получить из school_media
  };
}

