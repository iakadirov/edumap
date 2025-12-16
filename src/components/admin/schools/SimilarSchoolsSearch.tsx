'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Building2 } from 'lucide-react';

interface SimilarSchool {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  is_verified: boolean;
  similarity: number;
}

interface SimilarSchoolsSearchProps {
  query: string;
}

/**
 * Компонент для поиска и отображения похожих школ
 * Показывает школы с 80%+ схожестью по названию
 */
export function SimilarSchoolsSearch({ query }: SimilarSchoolsSearchProps) {
  const [similarSchools, setSimilarSchools] = useState<SimilarSchool[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setSimilarSchools([]);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Проверяем, что query валидный перед формированием URL
        if (!query || query.trim().length < 3) {
          setSimilarSchools([]);
          setLoading(false);
          return;
        }
        
        const url = `/api/admin/schools/similar?q=${encodeURIComponent(query.trim())}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setSimilarSchools(Array.isArray(data) ? data : []);
        } else {
          setSimilarSchools([]);
        }
      } catch (error) {
        console.error('Error fetching similar schools:', error);
        setSimilarSchools([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  if (query.length < 3 || (similarSchools.length === 0 && !loading)) {
    return null;
  }

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">
              O'xshash maktablar topildi ({similarSchools.length})
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              Quyidagi maktablar siz kiritgan nomga o'xshash. Iltimos, tekshiring - bu maktab allaqachon mavjud bo'lishi mumkin.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-amber-700">Qidirilmoqda...</p>
        ) : similarSchools.length > 0 ? (
          <div className="space-y-2">
            {similarSchools.map((school) => (
              <Link
                key={school.id}
                href={`/schools/${school.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
              >
                {school.logo_url ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <OptimizedImage
                      src={school.logo_url}
                      alt={school.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <Building2 className="h-8 w-8 text-amber-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-900 truncate">
                      {school.name}
                    </span>
                    {school.is_verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-amber-600">
                    {school.similarity}% o'xshashlik
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-amber-600 shrink-0" />
              </Link>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

