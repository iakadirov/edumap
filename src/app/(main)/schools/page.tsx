import { getActiveSchools } from '@/lib/supabase/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Страница списка школ
 * 
 * Features:
 * - Отображение всех активных школ из Supabase
 * - Базовая пагинация (если > 10 школ)
 * - Обработка состояний: loading, error, empty
 */
export default async function SchoolsPage() {
  let schools;
  let error: Error | null = null;

  try {
    schools = await getActiveSchools();
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

      {/* Список школ */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {schools.map((school: any) => {
        const details = Array.isArray(school.school_details) 
          ? school.school_details[0] 
          : school.school_details;
          
          return (
            <Card key={school.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{school.name}</CardTitle>
                  {school.overall_rating && (
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {school.overall_rating.toFixed(1)}
                    </div>
                  )}
                </div>
                {school.district && school.city && (
                  <p className="text-sm text-muted-foreground">
                    {school.district}, {school.city}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                {school.description && (
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {school.description}
                  </p>
                )}
                
                {details && (
                  <div className="mb-4 space-y-2 text-sm">
                    {details.school_type && (
                      <div>
                        <span className="font-medium">Тип: </span>
                        <span className="text-muted-foreground">
                          {details.school_type === 'private' && 'Частная'}
                          {details.school_type === 'state' && 'Государственная'}
                          {details.school_type === 'international' && 'Международная'}
                        </span>
                      </div>
                    )}
                    {details.fee_monthly_min && details.fee_monthly_max && (
                      <div>
                        <span className="font-medium">Стоимость: </span>
                        <span className="text-muted-foreground">
                          {details.fee_monthly_min.toLocaleString('ru-RU')} - {details.fee_monthly_max.toLocaleString('ru-RU')} сум/месяц
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/schools/${school.slug || school.id}`}>
                    Подробнее
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

