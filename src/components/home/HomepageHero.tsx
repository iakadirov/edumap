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
    color: '#0284c7',
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
    <div className="relative flex flex-col items-center justify-center min-h-[400px] sm:min-h-[450px] md:min-h-[520px] text-center space-y-6 sm:space-y-8 md:space-y-10 px-4 py-8 sm:py-10 md:py-12 overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-b from-transparent to-white/30">
      {/* Animated background decorations - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[24px] sm:rounded-[32px]">
        {/* Gradient blob 1 - smaller on mobile */}
        <div
          className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] rounded-full opacity-30 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(13,139,242,0.4) 0%, transparent 70%)',
            animationDuration: '4s'
          }}
        />
        {/* Gradient blob 2 */}
        <div
          className="absolute -bottom-16 -left-16 sm:-bottom-32 sm:-left-32 w-[250px] sm:w-[400px] md:w-[500px] h-[250px] sm:h-[400px] md:h-[500px] rounded-full opacity-25 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(129,71,245,0.3) 0%, transparent 70%)',
            animationDuration: '5s',
            animationDelay: '1s'
          }}
        />
        {/* Gradient blob 3 - hidden on mobile */}
        <div
          className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(49,171,8,0.2) 0%, transparent 70%)',
            animationDuration: '6s',
            animationDelay: '2s'
          }}
        />

        {/* Floating dots pattern - hidden on mobile */}
        <div className="hidden sm:block absolute top-20 left-[15%] w-2 h-2 rounded-full bg-[#0d8bf2]/20 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="hidden sm:block absolute top-40 right-[20%] w-3 h-3 rounded-full bg-[#0284c7]/20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
        <div className="hidden md:block absolute bottom-32 left-[25%] w-2.5 h-2.5 rounded-full bg-[#31ab08]/20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
        <div className="hidden md:block absolute bottom-40 right-[30%] w-2 h-2 rounded-full bg-[#ef6e2e]/20 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
      </div>

      {/* Main heading */}
      <div className="relative z-10 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[56px] font-bold tracking-[-0.03em] sm:tracking-[-0.04em] text-[#0c1319] leading-[1.2] sm:leading-[1.1] text-center px-2">
          O'zbekistondagi barcha{' '}
          <span className="text-[#0d8bf2] relative inline-block">
            ta'lim muassasalari
            {/* Underline decoration - hidden on small screens */}
            <svg
              className="hidden sm:block absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 text-[#0d8bf2]/20"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0,8 Q50,0 100,8 T200,8"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>{' '}
          bitta platformada
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#5a6c7d] leading-relaxed text-center px-2">
          Maktab, bog'cha, universitet yoki kurslarni toping, solishtiring va tanlang
        </p>
      </div>

      {/* Search form with autocomplete */}
      <div ref={searchRef} className="relative z-10 w-full max-w-xl md:max-w-2xl mx-auto px-2">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative group">
            {/* Glow effect on focus */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0d8bf2]/20 via-[#38bdf8]/20 to-[#0d8bf2]/20 rounded-[20px] sm:rounded-[28px] opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-300" />

            <div className="relative">
              <MagniferLinear className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a6c7d] z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
                placeholder="Maktab nomi yoki hudud..."
                className="w-full h-12 sm:h-14 pl-11 sm:pl-14 pr-24 sm:pr-32 md:pr-36 rounded-[16px] sm:rounded-[24px] border-2 border-transparent bg-white text-[#0c1319] placeholder:text-[#5a6c7d] text-sm sm:text-base focus:border-[#0d8bf2] focus:outline-none focus:ring-4 focus:ring-[#0d8bf2]/10 transition-all shadow-lg shadow-black/5"
              />
              <Button
                type="submit"
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-9 sm:h-10 rounded-[10px] sm:rounded-[12px] px-3 sm:px-4 md:px-6 bg-[#0d8bf2] hover:bg-[#0b7dd9] text-white text-sm sm:text-base font-semibold transition-all hover:shadow-lg hover:shadow-[#0d8bf2]/25"
              >
                <span className="hidden sm:inline">Qidirish</span>
                <MagniferLinear className="sm:hidden w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>

        {/* Search results dropdown */}
        {showResults && (results.length > 0 || isLoading) && (
          <div className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-2 bg-white rounded-[16px] sm:rounded-[24px] shadow-xl shadow-black/10 border border-[#d1d9e3] overflow-hidden z-50">
            {isLoading ? (
              <div className="p-4 text-center text-[#5a6c7d]">
                <div className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0d8bf2] border-t-transparent rounded-full animate-spin" />
                  Qidirilmoqda...
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.slug)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-[#f2f9ff] transition-colors text-left border-b border-[#d1d9e3] last:border-b-0 group/item"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {result.logo_url ? (
                        <img
                          src={result.logo_url}
                          alt={result.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[12px] object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] sm:rounded-[12px] bg-[#f2f9ff] flex items-center justify-center flex-shrink-0">
                          <BookBold className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d8bf2]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-[#0c1319] truncate group-hover/item:text-[#0d8bf2] transition-colors">
                          {result.name}
                        </div>
                        <div className="text-xs sm:text-sm text-[#5a6c7d] truncate">
                          {result.district && result.city
                            ? `${result.district}, ${result.city}`
                            : result.city || result.district}
                        </div>
                      </div>
                      {result.rating && (
                        <div className="text-xs sm:text-sm font-medium text-[#0d8bf2] bg-[#0d8bf2]/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex-shrink-0">
                          {result.rating.toFixed(1)}
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
      <div className="relative z-10 flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 sm:mt-4 px-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              className={cn(
                'inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-[16px] sm:rounded-[20px] md:rounded-[24px] text-xs sm:text-sm font-semibold transition-all duration-300',
                'bg-white/80 backdrop-blur-sm text-[#0c1319] hover:bg-white hover:shadow-lg hover:-translate-y-0.5 border border-white/50 hover:border-[#d1d9e3]'
              )}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: category.color }} />
              {category.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
