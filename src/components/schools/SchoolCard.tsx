'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { translateCity, translateDistrict } from '@/lib/utils/translations';
import { Check, Star, Shield, Heart, MoreHorizontal } from 'lucide-react';
import { refreshImageUrl, isPresignedUrl } from '@/lib/utils/image-url';
import { OptimizedImage } from '@/components/ui/optimized-image';
import type { Database } from '@/types/database';

type Organization = Database['public']['Tables']['organizations']['Row'] & {
  school_details?: Database['public']['Tables']['school_details']['Row'] | Database['public']['Tables']['school_details']['Row'][];
};

interface SchoolCardProps {
  school: Organization;
}

/**
 * Компонент карточки школы для списка
 * 
 * Features:
 * - Горизонтальная карточка с изображением слева
 * - Логотип школы поверх изображения
 * - Название с галочкой верификации
 * - Звездный рейтинг и количество отзывов
 * - Теги образования (Ta'lim)
 * - Бейдж общего рейтинга
 * - Футер с ценой и кнопками действий
 */
export function SchoolCard({ school }: SchoolCardProps) {
  // Состояние для обновленного URL логотипа
  const [logoUrl, setLogoUrl] = useState<string | null>(school.logo_url || null);
  
  // Предварительно обновляем presigned URL при монтировании компонента
  useEffect(() => {
    if (school.logo_url && isPresignedUrl(school.logo_url)) {
      refreshImageUrl(school.logo_url)
        .then((newUrl) => {
          setLogoUrl(newUrl);
        })
        .catch((error) => {
          console.error('Failed to refresh logo URL on mount:', error);
          // Оставляем исходный URL, если не удалось обновить
        });
    }
  }, [school.logo_url]);
  
  // Обрабатываем school_details (может быть массивом или объектом)
  const details = Array.isArray(school.school_details)
    ? school.school_details[0]
    : school.school_details;

  // Форматирование цены (только минимальная цена с "so'mdan")
  const formatPrice = (min: number | null) => {
    if (!min) return null;
    return `${min.toLocaleString('ru-RU')} so'mdan`;
  };

  // Получаем средний рейтинг отзывов (для звездного рейтинга)
  // Пока используем overall_rating / 20 для приблизительного значения
  // В будущем это должно быть отдельное поле average_review_rating
  const averageRating = school.overall_rating 
    ? (school.overall_rating / 20).toFixed(2) 
    : null;

  // Форматирование тегов образования
  const getEducationTags = () => {
    const tags: { label: string; bgColor: string }[] = [];
    
    if (details?.curriculum) {
      const curriculumLabels: Record<string, string> = {
        'national': 'Milliy dastur',
        'cambridge': 'Cambridge',
        'ib': 'IB',
      };
      
      const curricula = Array.isArray(details.curriculum) 
        ? details.curriculum 
        : [details.curriculum];
      
      curricula.forEach((curr) => {
        if (curr === 'national') {
          tags.push({ label: curriculumLabels[curr] || curr, bgColor: 'bg-slate-100' });
        } else {
          tags.push({ label: curriculumLabels[curr] || curr, bgColor: 'bg-orange-50' });
        }
      });
    }

    // Языки обучения
    if (details?.primary_language || details?.additional_languages) {
      const languages: string[] = [];
      if (details.primary_language) {
        const langLabels: Record<string, string> = {
          'uzbek': "O'zbek",
          'russian': 'Rus',
          'english': 'Ingliz',
        };
        languages.push(langLabels[details.primary_language] || details.primary_language);
      }
      if (details.additional_languages && Array.isArray(details.additional_languages)) {
        details.additional_languages.forEach((lang) => {
          const langLabels: Record<string, string> = {
            'uzbek': "O'zbek",
            'russian': 'Rus',
            'english': 'Ingliz',
          };
          const label = langLabels[lang] || lang;
          if (!languages.includes(label)) {
            languages.push(label);
          }
        });
      }
      if (languages.length > 0) {
        tags.push({ label: languages.join(', '), bgColor: 'bg-orange-50' });
      }
    }

    // Добавляем "Aniq fanlar" если есть STEM фокус (пока заглушка)
    // В будущем это должно быть из поля education_focus
    if (tags.length === 0) {
      tags.push({ label: 'Aniq fanlar', bgColor: 'bg-orange-50' });
    }

    return tags;
  };

  const educationTags = getEducationTags();

  return (
    <div className="relative bg-white rounded-[20px] shadow-[0px_0px_2px_0px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden">
      {/* Адаптивная структура: вертикальная на мобильных, горизонтальная на десктопе */}
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* Изображение школы - только левые углы скруглены на десктопе, растягивается на всю высоту */}
        <div className="relative w-full sm:w-64 md:w-80 h-48 sm:h-auto sm:self-stretch flex-shrink-0 overflow-hidden rounded-t-[20px] sm:rounded-tl-[20px] sm:rounded-bl-[20px] sm:rounded-tr-none sm:rounded-br-none">
          {school.cover_image_url ? (
            <OptimizedImage
              src={school.cover_image_url}
              alt={school.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 256px, 320px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          
          {/* Логотип школы поверх изображения - в левом верхнем углу */}
          {logoUrl && (
            <div className="absolute left-4 top-4 sm:left-5 sm:top-5 w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-[0px_0px_3px_0px_rgba(0,0,0,0.20)] border-2 border-white overflow-hidden bg-white z-10">
              <OptimizedImage
                src={logoUrl}
                alt={`${school.name} logo`}
                fill
                className="object-cover"
                sizes="64px"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Верхняя часть с информацией */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 p-4 sm:p-5">
            {/* Левая колонка с основной информацией */}
            <div className="flex-1 min-w-0">
              {/* Название и верификация */}
              <div className="flex items-center gap-1.5 mb-3 sm:mb-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-black truncate">
                  {school.name}
                </h3>
                {school.is_verified && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Адрес */}
              {(school.district || school.city) && (
                <p className="text-base sm:text-lg text-zinc-600 font-normal mb-3 sm:mb-2">
                  {[
                    school.district ? translateDistrict(school.district) : null,
                    school.city ? translateCity(school.city) : null
                  ].filter(Boolean).join(', ')}
                </p>
              )}

              {/* Звездный рейтинг и отзывы */}
              <div className="flex items-center gap-1.5 mb-3 sm:mb-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <span className="text-base sm:text-lg font-medium text-black">
                  {averageRating || '0.00'}
                </span>
                {school.reviews_count > 0 && (
                  <span className="text-sm sm:text-base text-zinc-600 font-normal">
                    ({school.reviews_count} ota-ona fikri)
                  </span>
                )}
              </div>

              {/* Теги образования (Ta'lim) */}
              {educationTags.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base font-semibold text-black flex-shrink-0">
                    Ta'lim:
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {educationTags.map((tag, index) => (
                      <div
                        key={index}
                        className={`px-2.5 sm:px-3 py-2 sm:py-2.5 ${tag.bgColor} rounded-lg flex items-center`}
                      >
                        <span className="text-xs sm:text-sm font-medium text-black">
                          {tag.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Правая колонка с бейджем рейтинга */}
            {school.overall_rating && (
              <div className="pl-2 sm:pl-2.5 pr-1.5 py-1 bg-emerald-50 rounded-lg flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto">
                <span className="text-xs sm:text-sm font-medium text-black">
                  Reyting:
                </span>
                <span className="text-base sm:text-lg font-medium text-black">
                  {school.overall_rating.toFixed(1)}
                </span>
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 stroke-emerald-500 flex-shrink-0" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Футер с ценой и кнопками */}
          <div className="px-4 sm:px-5 py-2.5 bg-slate-100 border-t border-slate-200 rounded-b-[20px] sm:rounded-br-[20px] sm:rounded-bl-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            {/* Цена */}
            <div className="flex items-center gap-1">
              <span className="text-base sm:text-lg font-medium text-black">
                Narxi:
              </span>
              {details?.fee_monthly_min ? (
                <span className="text-base sm:text-lg text-zinc-600 font-normal">
                  {formatPrice(details.fee_monthly_min)}
                </span>
              ) : (
                <span className="text-base sm:text-lg text-zinc-600 font-normal">
                  Mavjud emas
                </span>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
              <button className="p-2 bg-white rounded-full hover:bg-gray-50 transition-colors" aria-label="Дополнительные действия">
                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </button>
              <button className="p-2 bg-white rounded-full hover:bg-gray-50 transition-colors" aria-label="Добавить в избранное">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </button>
              <Button
                asChild
                variant="outline"
                className="px-3 sm:px-4 py-2 sm:py-3 bg-white border border-violet-100 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                <Link href={`/schools/${school.slug || school.id}`} prefetch={true}>
                  Batafsil
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
