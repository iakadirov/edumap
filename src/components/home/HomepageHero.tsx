'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MagniferLinear,
  BookBold,
  SmileCircleBold,
  SquareAcademicCapBold,
  NotebookBold,
} from '@solar-icons/react-perf';

const categories = [
  {
    id: 'schools',
    label: 'Maktablar',
    icon: BookBold,
    href: '/schools',
    color: '#0d8bf2',
  },
  {
    id: 'kindergartens',
    label: "Bog'chalar",
    icon: SmileCircleBold,
    href: '/kindergartens',
    color: '#31ab08',
  },
  {
    id: 'universities',
    label: 'OTM',
    icon: SquareAcademicCapBold,
    href: '/universities',
    color: '#8147f5',
  },
  {
    id: 'courses',
    label: 'Kurslar',
    icon: NotebookBold,
    href: '/courses',
    color: '#ef6e2e',
  },
];

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string;
  logo_url: string | null;
  rating: number | null;
  priceRange: string | null;
}

export function HomepageHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Закрываем результаты при клике вне области поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Поиск с задержкой (debounce)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = await response.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/schools?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = (slug: string) => {
    setShowResults(false);
    router.push(`/schools/${slug}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[560px] text-center space-y-12 px-4">
      {/* Main heading */}
      <div className="space-y-6 max-w-5xl mx-auto">
        <h1 className="text-[56px] font-bold tracking-[-0.04em] text-[#0c1319] leading-[1.1] text-center">
          O'zbekistondagi barcha{' '}
          <span className="text-[#0d8bf2]">ta'lim muassasalari</span>{' '}
          bitta platformada
        </h1>
        <p className="text-xl md:text-2xl text-[#5a6c7d] max-w-5xl mx-auto leading-relaxed text-center">
          Maktab, bog'cha, universitet yoki kurslarni toping, solishtiring va tanlang
        </p>
      </div>

      {/* Search form with autocomplete */}
      <div ref={searchRef} className="w-full max-w-2xl mx-auto relative">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <MagniferLinear className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6c7d] z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
              placeholder="Qidiruv: maktab nomi, hudud yoki kalit so'z..."
              className="w-full h-14 pl-14 pr-36 rounded-2xl border-2 border-transparent bg-[#fafdff] text-[#0c1319] placeholder:text-[#5a6c7d] focus:border-[#0d8bf2] focus:outline-none focus:ring-4 focus:ring-[#0d8bf2]/10 transition-all shadow-sm"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl px-6 bg-[#0d8bf2] hover:bg-[#0b7dd9] text-white font-semibold transition-all"
            >
              Qidirish
            </Button>
          </div>
        </form>

        {/* Search results dropdown */}
        {showResults && (results.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-[#d1d9e3] overflow-hidden z-50">
            {isLoading ? (
              <div className="p-4 text-center text-[#5a6c7d]">
                Qidirilmoqda...
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.slug)}
                    className="w-full px-4 py-3 hover:bg-[#f2f9ff] transition-colors text-left border-b border-[#d1d9e3] last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {result.logo_url && (
                        <img
                          src={result.logo_url}
                          alt={result.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0c1319] truncate">
                          {result.name}
                        </div>
                        <div className="text-sm text-[#5a6c7d] truncate">
                          {result.district && result.city
                            ? `${result.district}, ${result.city}`
                            : result.city || result.district}
                        </div>
                      </div>
                      {result.rating && (
                        <div className="text-sm font-medium text-[#0d8bf2]">
                          ⭐ {result.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Category quick links */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all',
                'bg-[#fafdff] text-[#0c1319] hover:bg-white hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-[#d1d9e3]'
              )}
            >
              <Icon className="w-5 h-5" style={{ color: category.color }} />
              {category.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
