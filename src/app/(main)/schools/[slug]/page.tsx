import { notFound } from 'next/navigation';
import { getSchoolBySlug, getSchoolWithBranches } from '@/lib/supabase/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import Image from 'next/image';

interface SchoolProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Страница профиля школы
 * 
 * Features:
 * - Полная информация о школе
 * - Контактная информация
 * - Детали: тип, классы, языки, программа, цены
 * - Услуги: транспорт, питание, продленка
 */
export default async function SchoolProfilePage({ params }: SchoolProfilePageProps) {
  const { slug } = await params;
  let school: any;
  let branchesData: any = null;
  let error: Error | null = null;

  try {
    // Получаем школу с филиалами
    branchesData = await getSchoolWithBranches(slug);
    school = branchesData.current;
  } catch (e) {
    error = e instanceof Error ? e : new Error('Ошибка загрузки школы');
    school = null;
  }

  // Школа не найдена
  if (!school || error) {
    notFound();
  }

  const details = Array.isArray(school.school_details)
    ? school.school_details[0]
    : school.school_details;
  
  const branches = branchesData?.branches || [];
  const isBranch = !!school.parent_organization_id;

  // Форматирование данных
  const schoolTypeLabels: Record<string, string> = {
    private: 'Частная',
    state: 'Государственная',
    international: 'Международная',
  };

  const languageLabels: Record<string, string> = {
    russian: 'Русский',
    uzbek: 'Узбекский',
    english: 'Английский',
  };

  const curriculumLabels: Record<string, string> = {
    national: 'Национальная',
    cambridge: 'Cambridge',
    ib: 'IB (International Baccalaureate)',
  };

  // Форматирование классов для отображения
  const formatGrades = (details: any) => {
    if (!details) return null;
    const parts: string[] = [];
    if (details.accepts_preparatory) {
      parts.push('0');
    }
    if (details.grade_from && details.grade_to) {
      parts.push(`${details.grade_from}–${details.grade_to}`);
    }
    return parts.join(', ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Кнопка назад */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/schools">← Назад к каталогу</Link>
        </Button>
      </div>

      {/* Информация о филиале/главной школе */}
      {isBranch && branchesData?.main && (
        <div className="mb-4 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Филиал сети:{' '}
            <Link
              href={`/schools/${branchesData.main.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {branchesData.main.name}
            </Link>
          </p>
        </div>
      )}

      {/* Заголовок школы */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Логотип - используем логотип главной школы, если это филиал */}
          {(school.logo_url || (isBranch && branchesData?.main?.logo_url)) && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={school.logo_url || branchesData?.main?.logo_url || ''}
                alt={school.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                {isBranch && (
                  <Badge variant="outline" className="mb-2">
                    Филиал
                  </Badge>
                )}
                <h1 className="mb-2 text-4xl font-bold">{school.name}</h1>
                {(school.district || school.city) && (
                  <p className="text-lg text-muted-foreground">
                    {[school.district, school.city].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              {school.overall_rating && (
                <div className="flex shrink-0 flex-col items-end">
                  <div className="rounded-full bg-primary/10 px-4 py-2 text-2xl font-bold text-primary">
                    {school.overall_rating.toFixed(1)}
                  </div>
                  <span className="mt-1 text-sm text-muted-foreground">
                    Рейтинг ({school.reviews_count || 0} отзывов)
                  </span>
                </div>
              )}
            </div>

            {/* Метки */}
            {details && (
              <div className="mt-4 flex flex-wrap gap-2">
                {details.school_type && (
                  <Badge variant="secondary">
                    {schoolTypeLabels[details.school_type] || details.school_type}
                  </Badge>
                )}
                {details.curriculum &&
                  details.curriculum.map((curr: string) => (
                    <Badge key={curr} variant="outline">
                      {curriculumLabels[curr] || curr}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">О школе</TabsTrigger>
          <TabsTrigger value="details">Детали</TabsTrigger>
          <TabsTrigger value="contacts">Контакты</TabsTrigger>
        </TabsList>

        {/* Вкладка: О школе */}
        <TabsContent value="about" className="space-y-6">
          {school.description && (
            <Card>
              <CardHeader>
                <CardTitle>Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {school.description}
                </p>
              </CardContent>
            </Card>
          )}

          {details && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Классы */}
              {(details.accepts_preparatory || (details.grade_from && details.grade_to)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Классы</CardTitle>
                    <CardDescription>Классы для приёма</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">
                      {formatGrades(details)}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Количество учеников */}
              {details.total_students && (
                <Card>
                  <CardHeader>
                    <CardTitle>Учеников</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">
                      {details.total_students.toLocaleString('ru-RU')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Размер класса */}
              {details.avg_class_size && (
                <Card>
                  <CardHeader>
                    <CardTitle>Средний размер класса</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{details.avg_class_size}</p>
                  </CardContent>
                </Card>
              )}

              {/* Стоимость */}
              {details.fee_monthly_min && details.fee_monthly_max && (
                <Card>
                  <CardHeader>
                    <CardTitle>Стоимость обучения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">
                      {details.fee_monthly_min.toLocaleString('ru-RU')} -{' '}
                      {details.fee_monthly_max.toLocaleString('ru-RU')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">сум в месяц</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Вкладка: Детали */}
        <TabsContent value="details" className="space-y-6">
          {details && (
            <>
              {/* Языки */}
              <Card>
                <CardHeader>
                  <CardTitle>Языки обучения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Основной: </span>
                      <span className="text-muted-foreground">
                        {languageLabels[details.primary_language] || details.primary_language}
                      </span>
                    </div>
                    {details.additional_languages && details.additional_languages.length > 0 && (
                      <div>
                        <span className="font-medium">Дополнительные: </span>
                        <span className="text-muted-foreground">
                          {details.additional_languages
                            .map((lang: string) => languageLabels[lang] || lang)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Программа */}
              {details.curriculum && details.curriculum.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Программа обучения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {details.curriculum.map((curr: string) => (
                        <Badge key={curr} variant="secondary">
                          {curriculumLabels[curr] || curr}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Услуги */}
              <Card>
                <CardHeader>
                  <CardTitle>Услуги</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <span className={details.has_transport ? 'text-green-600' : 'text-gray-400'}>
                        {details.has_transport ? '✓' : '✗'}
                      </span>
                      <span>Транспорт</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={details.has_meals ? 'text-green-600' : 'text-gray-400'}>
                        {details.has_meals ? '✓' : '✗'}
                      </span>
                      <span>Питание</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={details.has_extended_day ? 'text-green-600' : 'text-gray-400'}>
                        {details.has_extended_day ? '✓' : '✗'}
                      </span>
                      <span>Продленка</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Вкладка: Контакты */}
        <TabsContent value="contacts" className="space-y-6">
          {/* Филиалы (если есть) */}
          {branches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Филиалы</CardTitle>
                <CardDescription>
                  Другие филиалы сети {school.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {branches.map((branch: any) => {
                    const branchDetails = Array.isArray(branch.school_details)
                      ? branch.school_details[0]
                      : branch.school_details;
                    return (
                      <Link
                        key={branch.id}
                        href={`/schools/${branch.slug}`}
                        className="block rounded-lg border p-4 transition-colors hover:bg-muted"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{branch.name}</h3>
                            {(branch.district || branch.city) && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {[branch.district, branch.city].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {branchDetails?.fee_monthly_min && (
                              <p className="mt-2 text-sm">
                                От {branchDetails.fee_monthly_min.toLocaleString('ru-RU')} сум/мес
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">Филиал</Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {school.address && (
                <div>
                  <span className="font-medium">Адрес: </span>
                  <span className="text-muted-foreground">{school.address}</span>
                </div>
              )}

              {school.phone && (
                <div>
                  <span className="font-medium">Телефон: </span>
                  <a
                    href={`tel:${school.phone}`}
                    className="text-primary hover:underline"
                  >
                    {school.phone}
                  </a>
                </div>
              )}

              {school.email && (
                <div>
                  <span className="font-medium">Email: </span>
                  <a
                    href={`mailto:${school.email}`}
                    className="text-primary hover:underline"
                  >
                    {school.email}
                  </a>
                </div>
              )}

              {school.website && (
                <div>
                  <span className="font-medium">Сайт: </span>
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {school.website}
                  </a>
                </div>
              )}

              {/* Карта будет добавлена позже */}
              {school.lat && school.lng && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Карта будет добавлена позже
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

