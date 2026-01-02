'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  StarBold,
  CheckCircleBold,
  AltArrowRightBold,
  BookBold,
} from '@solar-icons/react-perf';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getThumbnailUrl } from '@/lib/utils/image-url';
import { SectionHeader, SectionContent } from '@/components/ui/section';

interface PopularSchool {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  overall_rating: number | null;
  reviews_count: number;
  is_verified: boolean;
  city: string | null;
  district: string | null;
}

export function PopularSchools() {
  const [schools, setSchools] = useState<PopularSchool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadSchools() {
      try {
        const response = await fetch('/api/schools?limit=6&sort=rating_desc');
        const data = await response.json();
        setSchools(data.schools || []);

        // Load thumbnails for each school
        const thumbs: Record<string, string> = {};
        for (const school of data.schools || []) {
          if (school.logo_url) {
            try {
              thumbs[school.id] = await getThumbnailUrl(school.logo_url, true);
            } catch {
              thumbs[school.id] = school.logo_url;
            }
          }
        }
        setThumbnails(thumbs);
      } catch (error) {
        console.error('Failed to load popular schools:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchools();
  }, []);

  if (isLoading) {
    return (
      <SectionContent>
        <SectionHeader
          title="Mashhur maktablar"
          subtitle="Eng yuqori baholangan maktablar"
        />
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-[20px] p-4 sm:p-5 border border-gray-100 animate-pulse">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </SectionContent>
    );
  }

  if (schools.length === 0) {
    return null;
  }

  return (
    <SectionContent>
      <SectionHeader
        title="Mashhur maktablar"
        subtitle="Eng yuqori baholangan maktablar"
      />

      {/* Schools grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {schools.map((school) => (
          <Link
            key={school.id}
            href={`/schools/${school.slug || school.id}`}
            className="group"
          >
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-gray-100 hover:shadow-lg hover:border-transparent hover:-translate-y-1 transition-all duration-300">
              {/* School info */}
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                {/* Logo */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {thumbnails[school.id] ? (
                    <OptimizedImage
                      src={thumbnails[school.id]}
                      alt={school.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookBold className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Name and location */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0c1319] truncate group-hover:text-[#0d8bf2] transition-colors">
                      {school.name}
                    </h3>
                    {school.is_verified && (
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <CheckCircleBold className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  {(school.district || school.city) && (
                    <p className="text-sm text-[#5a6c7d] truncate">
                      {[school.district, school.city].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating and action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StarBold className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <span className="text-sm sm:text-base font-medium text-[#0c1319]">
                    {school.overall_rating ? school.overall_rating.toFixed(1) : '—'}
                  </span>
                  {school.reviews_count > 0 && (
                    <span className="text-xs sm:text-sm text-[#5a6c7d]">
                      ({school.reviews_count})
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0d8bf2] group-hover:gap-2 transition-all">
                  Batafsil
                  <AltArrowRightBold className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View all button */}
      <div className="text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-[#0d8bf2] hover:bg-[#0d8bf2]/5 text-[#0c1319] text-base sm:text-lg font-semibold transition-all"
        >
          <Link href="/schools/list">
            Barcha maktablarni ko'rish
            <AltArrowRightBold className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </div>
    </SectionContent>
  );
}
