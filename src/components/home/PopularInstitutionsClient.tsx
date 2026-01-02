'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { SectionHeader, SectionContent } from '@/components/ui/section';

export type RecentInstitution = {
  id: string;
  name: string;
  name_uz: string | null;
  slug: string;
  org_type: OrganizationType;
  overall_rating: number | null;
  reviews_count: number;
  district: string | null;
  city: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  banner_url: string | null;
  created_at: string;
  school_details?: {
    fee_monthly_min: number | null;
    fee_monthly_max: number | null;
  } | null;
};

const categories = {
  school: {
    label: 'Maktab',
    icon: BookBold,
    href: '/schools',
    color: '#0d8bf2',
  },
  kindergarten: {
    label: "Bog'cha",
    icon: SmileCircleBold,
    href: '/kindergartens',
    color: '#31ab08',
  },
  university: {
    label: 'OTM',
    icon: SquareAcademicCapBold,
    href: '/universities',
    color: '#0284c7',
  },
  course: {
    label: 'Kurs',
    icon: NotebookBold,
    href: '/courses',
    color: '#ef6e2e',
  },
};

type OrganizationType = 'school' | 'kindergarten' | 'university' | 'course';

interface RecentInstitutionsClientProps {
  institutions: RecentInstitution[];
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

function InstitutionCard({ institution }: { institution: RecentInstitution }) {
  const [coverThumbnail, setCoverThumbnail] = useState<string | null>(null);
  const [logoThumbnail, setLogoThumbnail] = useState<string | null>(null);

  const displayName = institution.name_uz || institution.name;
  const coverUrl = institution.cover_image_url || institution.banner_url;
  const logoUrl = institution.logo_url;
  const category = categories[institution.org_type];
  const Icon = category?.icon || BookBold;
  const href = category ? `${category.href}/${institution.slug}` : `/schools/${institution.slug}`;

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

  return (
    <Link
      href={href}
      className="group block"
    >
      <div className="relative rounded-[20px] sm:rounded-[24px] bg-white border-2 border-gray-100 hover:border-[#0d8bf2] transition-all duration-300">
        {/* Cover image */}
        <div className="relative aspect-video overflow-hidden rounded-t-[18px] sm:rounded-t-[22px] bg-gradient-to-br from-blue-50 to-purple-50">
          {coverThumbnail ? (
            <OptimizedImage
              src={coverThumbnail}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Category badge */}
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5"
            style={{ backgroundColor: category?.color || '#0d8bf2' }}
          >
            <Icon className="w-3.5 h-3.5" />
            {category?.label}
          </div>
        </div>

        {/* Logo overlay - positioned outside overflow-hidden container */}
        {logoThumbnail && (
          <div className="absolute left-3 sm:left-4 top-[calc(56.25%-1.5rem)] sm:top-[calc(56.25%-1.75rem)] z-10">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-white shadow-lg overflow-hidden">
              <OptimizedImage
                src={logoThumbnail}
                alt={`${displayName} logo`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`p-4 sm:p-5 space-y-2.5 sm:space-y-3 ${logoThumbnail ? 'pt-7 sm:pt-8' : ''}`}>
          {/* Name */}
          <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-[#0d8bf2] transition-colors text-[#0c1319]">
            {displayName}
          </h3>

          {/* Rating */}
          {institution.overall_rating ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <StarBold className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-[#0c1319] text-sm sm:text-base">
                  {institution.overall_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-[#5a6c7d]">
                ({institution.reviews_count} sharh)
              </span>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-[#5a6c7d]">
              Hali baholanmagan
            </div>
          )}

          {/* Location */}
          {(institution.district || institution.city) && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#5a6c7d]">
              <MapPointLinear className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {[institution.district, institution.city].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Price */}
          {price && (
            <div className="text-xs sm:text-sm font-semibold text-[#0d8bf2]">
              {price}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function RecentInstitutionsClient({ institutions }: RecentInstitutionsClientProps) {
  if (institutions.length === 0) {
    return (
      <SectionContent>
        <SectionHeader
          title="Yangi qo'shilgan ta'lim muassasalari"
          subtitle="EduMap platformasiga eng so'nggi qo'shilgan ta'lim muassasalari"
        />
        <div className="text-center py-12 text-gray-500">
          Hozircha ma'lumotlar mavjud emas
        </div>
      </SectionContent>
    );
  }

  return (
    <SectionContent>
      <SectionHeader
        title="Yangi qo'shilgan ta'lim muassasalari"
        subtitle="EduMap platformasiga eng so'nggi qo'shilgan ta'lim muassasalari"
      />

      {/* Institution cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {institutions.map((institution) => (
          <InstitutionCard key={institution.id} institution={institution} />
        ))}
      </div>

      {/* View all button */}
      <div className="flex justify-center">
        <Button
          asChild
          variant="outline"
          className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-[#0d8bf2] hover:bg-[#0d8bf2]/5 text-[#0c1319] text-base sm:text-lg font-semibold transition-all"
        >
          <Link href="/schools/list">
            Barcha muassasalarni ko'rish
          </Link>
        </Button>
      </div>
    </SectionContent>
  );
}

