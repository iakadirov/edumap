import { getCities, type SortOption } from '@/lib/supabase/queries';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { SchoolsList } from './schools-list';
import { RegionFilterSync } from '@/components/schools/RegionFilterSync';

// Динамический импорт SchoolFilters для уменьшения bundle size
// Это client component, поэтому загружаем его только когда нужно
const SchoolFilters = dynamic(
  () => import('@/components/schools/SchoolFilters').then((mod) => ({ default: mod.SchoolFilters })),
  {
    ssr: true, // Все равно рендерим на сервере для SEO
    loading: () => (
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    ),
  }
);

// Кэширование на 300 секунд (5 минут) для быстрой загрузки
export const revalidate = 300;

interface SchoolsPageProps {
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
  };
}

/**
 * Страница списка школ
 * 
 * Features:
 * - Отображение всех активных школ из Supabase
 * - Фильтрация школ по различным параметрам
 * - Обработка состояний: loading, error, empty
 * - Streaming SSR с Suspense для быстрой загрузки
 */
export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  // В Next.js 16 searchParams может быть Promise, проверяем
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  let cities: string[] = [];

  try {
    // Districts теперь загружаются на клиенте через DistrictsLoader
    // Получаем только cities
    cities = await getCities();
  } catch (e) {
    // В случае ошибки просто используем пустой массив
    cities = [];
  }

  return (
    <div className="container-wrapper py-8 bg-white">
      {/* Синхронизация выбранной области с URL */}
      <RegionFilterSync />
      <div className="container-content">
        <div className="container-inner">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Maktablar katalogi</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* Панель фильтров - загружается сразу */}
            <aside className="lg:sticky lg:top-4 lg:h-fit">
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
            </aside>

            {/* Список школ - загружается отдельно через Suspense для streaming */}
            <div className="space-y-6">
              <Suspense 
                fallback={
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
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
