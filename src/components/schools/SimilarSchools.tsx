'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { AltArrowRightBold, StarBold, MapPointBold } from '@solar-icons/react-perf';
import type { SchoolProfile } from '@/types/school';

interface SimilarSchool {
  id: string;
  slug: string;
  name: string;
  coverImage: string;
  rating: {
    score: number;
    reviewCount: number;
  };
  district: {
    name: string;
  };
  fee: {
    min: number;
  };
}

interface SimilarSchoolsProps {
  currentSchool: SchoolProfile;
}

/**
 * Компонент "Похожие школы"
 * 
 * Отображает сетку из 3 похожих школ с:
 * - Изображением
 * - Названием
 * - Рейтингом
 * - Районом
 * - Ценой
 */
export function SimilarSchools({ currentSchool }: SimilarSchoolsProps) {
  const [schools, setSchools] = useState<SimilarSchool[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadSimilarSchools();
  }, [currentSchool.slug]);
  
  const loadSimilarSchools = async () => {
    try {
      const response = await fetch(`/api/schools/${currentSchool.slug}/similar?limit=3`);
      const data = await response.json();
      setSchools(data.schools || []);
    } catch (error) {
      console.error('Error loading similar schools:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };
  
  if (loading) {
    return null;
  }
  
  if (schools.length === 0) {
    return null;
  }
  
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Похожие школы</h2>
        <Button variant="ghost" className="text-blue-600" asChild>
          <Link href="/schools/list">
            Все школы
            <AltArrowRightBold className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {schools.map((school) => (
          <Link
            key={school.id}
            href={`/schools/${school.slug}`}
            className="block border border-gray-200 rounded-[24px] overflow-hidden hover:border-blue-200 hover:shadow-md transition"
          >
            {/* Image */}
            <div className="aspect-[16/10] relative">
              <OptimizedImage
                src={school.coverImage}
                alt={school.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
              />
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{school.name}</h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <StarBold className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{school.rating.score.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>({school.rating.reviewCount})</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <MapPointBold className="w-4 h-4" />
                {school.district.name}
              </div>
              
              <div className="font-medium text-gray-900">
                от {formatPrice(school.fee.min)} сум
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

