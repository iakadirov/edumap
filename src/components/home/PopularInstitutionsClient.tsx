'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BookBold,
  SmileCircleBold,
  SquareAcademicCapBold,
  NotebookBold,
  StarBold,
  MapPointLinear,
} from '@solar-icons/react-perf';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getThumbnailUrl } from '@/lib/utils/image-url';
import { useEffect, useMemo } from 'react';

export type PopularInstitution = {
  id: string;
  name: string;
  name_uz: string | null;
  slug: string;
  overall_rating: number | null;
  reviews_count: number;
  district: string | null;
  city: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  banner_url: string | null;
  school_details?: {
    fee_monthly_min: number | null;
    fee_monthly_max: number | null;
  } | null;
};

const categories = [
  {
    id: 'school' as const,
    label: 'Maktablar',
    icon: BookBold,
    href: '/schools',
  },
  {
    id: 'kindergarten' as const,
    label: "Bog'chalar",
    icon: SmileCircleBold,
    href: '/kindergartens',
  },
  {
    id: 'university' as const,
    label: 'Oliygohlar',
    icon: SquareAcademicCapBold,
    href: '/universities',
  },
  {
    id: 'course' as const,
    label: 'Kurslar',
    icon: NotebookBold,
    href: '/courses',
  },
];

type OrganizationType = 'school' | 'kindergarten' | 'university' | 'course';

interface PopularInstitutionsClientProps {
  institutions: {
    school: PopularInstitution[];
    kindergarten: PopularInstitution[];
    university: PopularInstitution[];
    course: PopularInstitution[];
  };
}

function formatPrice(min: number | null, max: number | null): string {
  if (!min && !max) return 'Narx ko\'rsatilmagan';
  
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  if (min && max) {
    return `${formatAmount(min)} - ${formatAmount(max)} so'm`;
  }
  if (min) {
    return `${formatAmount(min)}+ so'm`;
  }
  return `gacha ${formatAmount(max!)} so'm`;
}

function InstitutionCard({ institution, orgType }: { institution: PopularInstitution; orgType: OrganizationType }) {
  const [coverThumbnail, setCoverThumbnail] = useState<string | null>(null);
  const [logoThumbnail, setLogoThumbnail] = useState<string | null>(null);

  const displayName = institution.name_uz || institution.name;
  const coverUrl = institution.cover_image_url || institution.banner_url;
  const logoUrl = institution.logo_url;

  // Загружаем thumbnail версии изображений
  useEffect(() => {
    if (coverUrl) {
      getThumbnailUrl(coverUrl, false)
        .then(setCoverThumbnail)
        .catch(() => setCoverThumbnail(coverUrl));
    }
    if (logoUrl) {
      getThumbnailUrl(logoUrl, true)
        .then(setLogoThumbnail)
        .catch(() => setLogoThumbnail(logoUrl));
    }
  }, [coverUrl, logoUrl]);

  const price = institution.school_details
    ? formatPrice(institution.school_details.fee_monthly_min, institution.school_details.fee_monthly_max)
    : null;

  const category = categories.find(c => c.id === orgType);
  const Icon = category?.icon || BookBold;
  const href = category ? `${category.href}/${institution.slug}` : `/schools/${institution.slug}`;

  return (
    <Link 
      href={href}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-[24px] bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Cover image */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
          {coverThumbnail ? (
            <OptimizedImage
              src={coverThumbnail}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-16 h-16 text-gray-200" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Logo overlay */}
          {logoThumbnail && (
            <div className="absolute bottom-0 left-4 translate-y-1/2">
              <div className="relative w-16 h-16 rounded-[12px] bg-white p-2 shadow-lg">
                <OptimizedImage
                  src={logoThumbnail}
                  alt={`${displayName} logo`}
                  fill
                  className="object-contain rounded-[24px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 pt-8 space-y-3">
          {/* Name */}
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {displayName}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <StarBold className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-900">
                {institution.overall_rating?.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({institution.reviews_count} {institution.reviews_count === 1 ? 'sharh' : 'sharh'})
            </span>
          </div>

          {/* Location */}
          {(institution.district || institution.city) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPointLinear className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {[institution.district, institution.city].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Price */}
          {price && (
            <div className="text-sm font-semibold text-blue-600">
              {price}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PopularInstitutionsClient({ institutions }: PopularInstitutionsClientProps) {
  // Определяем активную категорию по умолчанию (первая с данными)
  const defaultCategory = useMemo(() => {
    if (institutions.school.length > 0) return 'school';
    if (institutions.kindergarten.length > 0) return 'kindergarten';
    if (institutions.university.length > 0) return 'university';
    return 'course';
  }, [institutions]);

  const [activeCategory, setActiveCategory] = useState<OrganizationType>(defaultCategory);

  const activeInstitutions = institutions[activeCategory];
  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  // Фильтруем категории, оставляя только те, у которых есть данные
  const availableCategories = categories.filter(cat => institutions[cat.id].length > 0);

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Mashhur ta'lim muassasalari
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Eng yaxshi reyting va ko'p sharhlar olgan muassasalar
        </p>
      </div>

      {/* Category tabs */}
      {availableCategories.length > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {availableCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Institution cards */}
      {activeInstitutions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {activeInstitutions.map((institution) => (
            <InstitutionCard key={institution.id} institution={institution} orgType={activeCategory} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Hozircha ma'lumotlar mavjud emas
        </div>
      )}

      {/* View all button */}
      {activeInstitutions.length > 0 && activeCategoryData && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="rounded-[12px]">
            <Link href={activeCategoryData.href}>
              Barcha {activeCategoryData.label.toLowerCase()}ni ko'rish
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

