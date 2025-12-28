'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import {
  CheckCircleBold,
  StarBold,
  MedalStarBold,
  MedalRibbonBold,
  CameraBold,
  MapPointBold,
  BookBold,
  GlobusBold,
  UserBold,
} from '@solar-icons/react-perf';
import type { SchoolProfile } from '@/types/school';

interface SchoolHeroProps {
  school: SchoolProfile;
}

/**
 * HERO секция страницы профиля школы
 * 
 * Включает:
 * - Обложка с бейджем рейтинга и счетчиком фото
 * - Логотип школы
 * - Название и badges (верифицирована, TOP-10, награды)
 * - Рейтинг со звездами и ссылкой на отзывы
 * - Локация (район, адрес)
 * - Quick Info Cards (Программа, Языки, Классы)
 * - Features (бассейн, транспорт, питание и т.д.)
 */
export function SchoolHero({ school }: SchoolHeroProps) {
  // Конвертируем рейтинг из 0-100 в 0-5 для отображения
  const ratingScore = school.rating.score / 20;
  const roundedRating = Math.round(ratingScore * 10) / 10;
  
  // Конфигурация для features
  const featureConfig: Record<string, { icon: string; label: string }> = {
    pool: { icon: '🏊', label: 'Бассейн' },
    transport: { icon: '🚌', label: 'Транспорт' },
    meals: { icon: '🍽', label: 'Питание' },
    stem: { icon: '🔬', label: 'STEM' },
    arts: { icon: '🎭', label: 'Театр' },
    music: { icon: '🎵', label: 'Музыка' },
    sports: { icon: '⚽', label: 'Спорт' },
    library: { icon: '📚', label: 'Библиотека' },
    lab: { icon: '🔬', label: 'Лаборатория' },
    gym: { icon: '💪', label: 'Спортзал' },
  };
  
  return (
    <section className="school-hero space-y-6">
      {/* Cover Image */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-[24px]">
        <OptimizedImage
          src={school.coverImage}
          alt={school.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1440px"
        />
        
        {/* Rank Badge on Photo */}
        {school.rating.rank && (
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-3 py-2 rounded-[24px] font-bold shadow-lg">
            #{school.rating.rank} в рейтинге
          </div>
        )}
        
        {/* Photos Count */}
        {school.photosCount !== undefined && school.photosCount > 0 && (
          <button className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-[24px] flex items-center gap-2 hover:bg-black/80 transition">
            <CameraBold className="w-4 h-4" />
            <span>{school.photosCount} фото</span>
          </button>
        )}
      </div>
      
      {/* School Info */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Logo */}
        <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-gray-100 flex-shrink-0">
          <OptimizedImage
            src={school.logo}
            alt={`${school.name} logo`}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            sizes="80px"
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {school.name}
          </h1>
          
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-3">
            {school.badges.isVerified && (
              <Badge variant="default" className="gap-1">
                <CheckCircleBold className="w-3 h-3" />
                Верифицирована
              </Badge>
            )}
            {school.badges.ranking?.type === 'top10' && (
              <Badge variant="default" className="gap-1 bg-blue-600">
                <MedalStarBold className="w-3 h-3" />
                TOP-10
              </Badge>
            )}
            {school.badges.ranking?.type === 'top3' && (
              <Badge variant="default" className="gap-1 bg-amber-600">
                <MedalStarBold className="w-3 h-3" />
                TOP-3
              </Badge>
            )}
            {school.badges.ranking?.type === 'top1' && (
              <Badge variant="default" className="gap-1 bg-yellow-500">
                <MedalStarBold className="w-3 h-3" />
                #1
              </Badge>
            )}
            {school.badges.awards?.map((award, idx) => (
              <Badge key={idx} variant="outline" className="gap-1">
                <MedalRibbonBold className="w-3 h-3" />
                {award.name} {award.year}
              </Badge>
            ))}
          </div>
          
          {/* Rating Row */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarBold
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(ratingScore)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-900">
              {roundedRating}
            </span>
            <span className="text-gray-500">•</span>
            <Link href="#reviews" className="text-gray-600 hover:text-blue-600 transition">
              {school.rating.reviewCount} отзывов
            </Link>
            {school.rating.rank && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  #{school.rating.rank} в рейтинге школ
                </span>
              </>
            )}
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <MapPointBold className="w-4 h-4 flex-shrink-0" />
            <span>
              {school.location.district}
              {school.location.address && `, ${school.location.address}`}
            </span>
          </div>
          
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-[24px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[24px] bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookBold className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500">Программа</div>
                <div className="font-medium text-gray-900 truncate">
                  {school.curriculum.join(', ')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[24px] bg-green-100 flex items-center justify-center flex-shrink-0">
                <GlobusBold className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500">Языки</div>
                <div className="font-medium text-gray-900 truncate">
                  {school.languages.join(' / ')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[24px] bg-purple-100 flex items-center justify-center flex-shrink-0">
                <UserBold className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500">Классы</div>
                <div className="font-medium text-gray-900">
                  {school.grades.from}-{school.grades.to} класс
                  {school.grades.from === 0 && ' (0 класс)'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          {school.features && school.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {school.features.map((feature) => {
                const config = featureConfig[feature.toLowerCase()] || { icon: '✓', label: feature };
                return (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-[12px] text-sm"
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

