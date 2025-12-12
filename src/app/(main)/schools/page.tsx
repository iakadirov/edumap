import { getActiveSchools, getSchoolsWithFilters, getDistricts, getCities } from '@/lib/supabase/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SchoolCard } from '@/components/schools/SchoolCard';
import { SchoolFilters } from '@/components/schools/SchoolFilters';
import Link from 'next/link';

interface SchoolsPageProps {
  searchParams: {
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
 */
export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  let schools;
  let districts: string[] = [];
  let cities: string[] = [];
  let error: Error | null = null;

  try {
    // Получаем списки для фильтров
    [districts, cities] = await Promise.all([getDistricts(), getCities()]);

    // Проверяем, есть ли фильтры в URL
    const hasFilters = 
      searchParams.district ||
      searchParams.city ||
      searchParams.school_type ||
      searchParams.price_min ||
      searchParams.price_max ||
      searchParams.language ||
      searchParams.curriculum;

    if (hasFilters) {
      // Используем фильтры
      const filters = {
        district: searchParams.district,
        city: searchParams.city,
        school_type: searchParams.school_type,
        price_min: searchParams.price_min ? Number(searchParams.price_min) : undefined,
        price_max: searchParams.price_max ? Number(searchParams.price_max) : undefined,
        language: searchParams.language,
        curriculum: searchParams.curriculum ? searchParams.curriculum.split(',') : undefined,
      };
      schools = await getSchoolsWithFilters(filters);
    } else {
      // Получаем все школы
      schools = await getActiveSchools();
    }
  } catch (e) {
    error = e instanceof Error ? e : new Error('Ошибка загрузки школ');
    schools = null;
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Ошибка загрузки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Не удалось загрузить список школ. Попробуйте обновить страницу.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Пустое состояние
  if (!schools || schools.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold">Каталог школ</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Школы пока не добавлены. Вернитесь позже.
          </p>
          <Button asChild>
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Каталог школ</h1>
        <p className="text-lg text-muted-foreground">
          Найдено школ: <span className="font-semibold text-foreground">{schools.length}</span>
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Панель фильтров */}
        <aside className="lg:sticky lg:top-4 lg:h-fit">
          <SchoolFilters 
            districts={districts} 
            cities={cities}
            initialFilters={searchParams}
          />
        </aside>

        {/* Список школ */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {schools.map((school: any) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </div>
    </div>
  );
}

