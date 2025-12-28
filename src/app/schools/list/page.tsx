import { getCities, type SortOption } from '@/lib/supabase/queries';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { SchoolsList } from '../schools-list';
import { RegionFilterSync } from '@/components/schools/RegionFilterSync';
import { generateSchoolsListTitle, generateSchoolsListDescription, generateSchoolsListPageTitle } from '@/lib/utils/page-titles';
import type { Metadata } from 'next';

// Динамический импорт SchoolFilters для уменьшения bundle size
// Это client component, поэтому загружаем его только когда нужно
const SchoolFilters = dynamic(
  () => import('@/components/schools/SchoolFilters').then((mod) => ({ default: mod.SchoolFilters })),
  {
    ssr: true, // Все равно рендерим на сервере для SEO
    loading: () => (
      <div className="h-96 bg-muted animate-pulse rounded-[24px]" />
    ),
  }
);

// Кэширование на 300 секунд (5 минут) для быстрой загрузки
export const revalidate = 300;

/**
 * Генерация мета-тегов для страницы каталога школ
 */
export async function generateMetadata({ searchParams }: SchoolsListPageProps): Promise<Metadata> {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  
  const title = await generateSchoolsListTitle({
    region: params.region,
    district: params.district,
    city: params.city,
    school_type: params.school_type,
  });
  
  const description = await generateSchoolsListDescription({
    region: params.region,
    district: params.district,
    city: params.city,
    school_type: params.school_type,
  });
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

interface SchoolsListPageProps {
  searchParams: Promise<{
    region?: string; // ID области
    district?: string;
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string;
    curriculum?: string;
    grade?: string;
    rating_min?: string;
    has_transport?: string;
    has_meals?: string;
    has_extended_day?: string;
    sort?: SortOption;
    page?: string;
  }> | {
    region?: string; // ID области
    district?: string;
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string;
    curriculum?: string;
    grade?: string;
    rating_min?: string;
    has_transport?: string;
    has_meals?: string;
    has_extended_day?: string;
    sort?: SortOption;
    page?: string;
  };
}

/**
 * Страница каталога школ
 * 
 * URL: /schools/list
 * 
 * Features:
 * - Отображение всех активных школ из Supabase
 * - Фильтрация школ по различным параметрам
 * - Обработка состояний: loading, error, empty
 * - Streaming SSR с Suspense для быстрой загрузки
 */
export default async function SchoolsListPage({ searchParams }: SchoolsListPageProps) {
  // В Next.js 16 searchParams может быть Promise, проверяем
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  let cities: string[] = [];

  try {
    // Districts теперь загружаются на клиенте через DistrictsLoader
    // Получаем только cities
    cities = await getCities();
  } catch (e) {
    // В случае ошибки просто используем пустой массив
    console.error('Error loading cities:', e);
    cities = [];
  }

  // Генерируем динамический заголовок для мета-тегов
  const metaTitle = await generateSchoolsListTitle({
    region: params.region,
    district: params.district,
    city: params.city,
    school_type: params.school_type,
  });

  // Генерируем динамический заголовок для страницы
  const pageTitle = await generateSchoolsListPageTitle({
    region: params.region,
    district: params.district,
  });

  return (
    <div className="container-wrapper pt-6 pb-0">
      <div className="container-content">
        {/* Синхронизация выбранной области с URL */}
        <RegionFilterSync />
        {/* Основной контейнер */}
        <div className="w-full flex flex-col gap-5">
          {/* Фильтры сверху горизонтально - на всю ширину */}
          <div className="w-full">
            <SchoolFilters 
              cities={cities}
              initialFilters={{
                district: params.district,
                city: params.city,
                school_type: params.school_type,
                price_min: params.price_min,
                price_max: params.price_max,
                language: params.language,
                curriculum: params.curriculum,
                grade: params.grade,
                rating_min: params.rating_min,
                has_transport: params.has_transport,
                has_meals: params.has_meals,
                has_extended_day: params.has_extended_day,
              }}
            />
          </div>

          {/* Заголовок - после фильтров, но до количества школ */}
          <div className="container-inner">
            <h1 className="text-xl sm:text-2xl font-semibold text-black">
              {pageTitle}
            </h1>
          </div>

          {/* Список школ - загружается отдельно через Suspense для streaming */}
          <div className="container-inner">
            <div className="w-full flex flex-col gap-4 sm:gap-5">
              <Suspense 
                fallback={
                  <div className="space-y-4 sm:space-y-5 w-full">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-48 sm:h-[242px] bg-muted animate-pulse rounded-[20px]" />
                    ))}
                  </div>
                }
              >
                <SchoolsList params={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

