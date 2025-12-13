import { getDistricts, getCities } from '@/lib/supabase/queries';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { SchoolsList } from './schools-list';

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
    district?: string;
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string;
    curriculum?: string;
  }> | {
    district?: string;
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string;
    curriculum?: string;
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
  let districts: string[] = [];
  let cities: string[] = [];

  try {
    // Получаем только списки для фильтров (параллельно, быстрее)
    [districts, cities] = await Promise.all([getDistricts(), getCities()]);
  } catch (e) {
    // В случае ошибки просто используем пустые массивы
    districts = [];
    cities = [];
  }

  return (
    <div className="container-wrapper py-8 bg-white">
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
                districts={districts} 
                cities={cities}
                initialFilters={{
                  district: params.district,
                  city: params.city,
                  school_type: params.school_type,
                  price_min: params.price_min,
                  price_max: params.price_max,
                  language: params.language,
                  curriculum: params.curriculum,
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
