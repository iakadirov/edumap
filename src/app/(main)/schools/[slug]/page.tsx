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
 * - Aloqa maʼlumotlari
 * - Детали: тип, классы, языки, программа, цены
 * - Xizmatlar: транспорт, питание, продленка
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
    private: 'Xususiy',
    state: 'Davlat',
    international: 'Xalqaro',
  };

  const languageLabels: Record<string, string> = {
    russian: 'Rus',
    uzbek: 'Oʻzbek',
    english: 'Ingliz',
  };

  const curriculumLabels: Record<string, string> = {
    national: 'Milliy',
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
    <div className="container-wrapper py-8">
      <div className="container-content">
        <div className="container-inner">
          {/* Кнопка назад */}
          <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/schools">← Katalogga qaytish</Link>
        </Button>
      </div>

      {/* Информация о филиале/главной школе */}
      {isBranch && branchesData?.main && (
        <div className="mb-4 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Tarmoq filiali:{' '}
            <Link
              href={`/schools/${branchesData.main.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {branchesData.main.name}
            </Link>
          </p>
        </div>
      )}

      {/* Обложка школы */}
      {school.cover_image_url && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg">
          <Image
            src={school.cover_image_url}
            alt={school.name}
            fill
            className="object-cover"
            priority
          />
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
                    Filial
                  </Badge>
                )}
                <h1 className="mb-2 text-4xl font-bold">{school.name}</h1>
                {(school.name_uz || school.name_ru) && (
                  <p className="mb-2 text-lg text-muted-foreground">
                    {school.name_uz && school.name_ru
                      ? `${school.name_uz} / ${school.name_ru}`
                      : school.name_uz || school.name_ru}
                  </p>
                )}
                <div className="space-y-1">
                  {[school.region, school.district, school.city, school.landmark]
                    .filter(Boolean)
                    .length > 0 && (
                    <p className="text-muted-foreground">
                      {[
                        school.region,
                        school.district,
                        school.city,
                        school.landmark && `(${school.landmark})`,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {school.founded_year && (
                    <p className="text-sm text-muted-foreground">
                      {school.founded_year} yilda tashkil etilgan
                    </p>
                  )}
                  {school.motto && (
                    <p className="text-sm italic text-muted-foreground">"{school.motto}"</p>
                  )}
                </div>
                {school.short_description && (
                  <p className="mt-3 text-muted-foreground">{school.short_description}</p>
                )}
              </div>

              {school.overall_rating && (
                <div className="flex shrink-0 flex-col items-end">
                  <div className="rounded-full bg-primary/10 px-4 py-2 text-2xl font-bold text-primary">
                    {school.overall_rating.toFixed(1)}
                  </div>
                  <span className="mt-1 text-sm text-muted-foreground">
                    Reyting ({school.reviews_count || 0} sharh)
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
                {details.has_international_accreditation && (
                  <Badge variant="default">Xalqaro akkreditatsiya</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">Maktab haqida</TabsTrigger>
          <TabsTrigger value="details">Tafsilotlar</TabsTrigger>
          <TabsTrigger value="infrastructure">Infratuzilma</TabsTrigger>
          <TabsTrigger value="contacts">Aloqa</TabsTrigger>
        </TabsList>

        {/* Вкладка: О школе */}
        <TabsContent value="about" className="space-y-6">
          {school.description && (
            <Card>
              <CardHeader>
                <CardTitle>Tavsif</CardTitle>
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
                    <CardTitle>Sinf</CardTitle>
                    <CardDescription>Qabul qilinadigan sinflar</CardDescription>
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
                    <CardTitle>Oʻquvchilar</CardTitle>
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
                    <CardTitle>Oʻrtacha sinf hajmi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{details.avg_class_size}</p>
                  </CardContent>
                </Card>
              )}

              {/* Учителя */}
              {details.total_teachers && (
                <Card>
                  <CardHeader>
                    <CardTitle>Oʻqituvchilar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{details.total_teachers}</p>
                    {details.teachers_with_higher_ed_percent && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {details.teachers_with_higher_ed_percent}% yuqori maʼlumotli
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Стоимость */}
              {details.fee_monthly_min && details.fee_monthly_max && (
                <Card>
                  <CardHeader>
                    <CardTitle>Taʼlim narxi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">
                      {details.fee_monthly_min.toLocaleString('ru-RU')} -{' '}
                      {details.fee_monthly_max.toLocaleString('ru-RU')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">soʻm/oy</p>
                    {details.has_sibling_discount && details.sibling_discount_percent && (
                      <p className="mt-2 text-sm text-green-600">
                        Ikkinchi farzand uchun chegirma: {details.sibling_discount_percent}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Jadval */}
          {details &&
            (details.school_start_time ||
              details.school_end_time ||
              details.lesson_duration ||
              details.lessons_per_day ||
              details.has_saturday_classes ||
              details.extended_day_until) && (
              <Card>
                <CardHeader>
                  <CardTitle>Jadval</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(details.school_start_time || details.school_end_time) && (
                    <div>
                      <span className="font-medium">Dars vaqti: </span>
                      <span className="text-muted-foreground">
                        {details.school_start_time && details.school_end_time
                          ? `${details.school_start_time} - ${details.school_end_time}`
                          : details.school_start_time || details.school_end_time}
                      </span>
                    </div>
                  )}
                  {details.lesson_duration && (
                    <div>
                      <span className="font-medium">Dars davomiyligi: </span>
                      <span className="text-muted-foreground">{details.lesson_duration} daqiqa</span>
                    </div>
                  )}
                  {details.lessons_per_day && (
                    <div>
                      <span className="font-medium">Kuniga darslar: </span>
                      <span className="text-muted-foreground">{details.lessons_per_day}</span>
                    </div>
                  )}
                  {details.extended_day_until && details.has_extended_day && (
                    <div>
                      <span className="font-medium">Kengaytirilgan kun: </span>
                      <span className="text-muted-foreground">{details.extended_day_until}</span>
                    </div>
                  )}
                  {details.has_saturday_classes && (
                    <div>
                      <span className="font-medium">Shanba kunlari darslar: </span>
                      <span className="text-muted-foreground">Ha</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Pedagogik tarkib */}
          {details &&
            (details.total_teachers ||
              details.teachers_with_higher_ed_percent ||
              details.avg_teacher_experience_years ||
              details.has_foreign_teachers ||
              details.native_english_speakers_count) && (
              <Card>
                <CardHeader>
                  <CardTitle>Pedagogik tarkib</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {details.avg_teacher_experience_years && (
                    <div>
                      <span className="font-medium">Oʻrtacha ish staji: </span>
                      <span className="text-muted-foreground">
                        {details.avg_teacher_experience_years} yil
                      </span>
                    </div>
                  )}
                  {details.has_foreign_teachers && (
                    <div>
                      <span className="font-medium">Chet ellik oʻqituvchilar: </span>
                      <span className="text-muted-foreground">Ha</span>
                    </div>
                  )}
                  {details.native_english_speakers_count && (
                    <div>
                      <span className="font-medium">Ingliz tili soʻzlashuvchilar: </span>
                      <span className="text-muted-foreground">
                        {details.native_english_speakers_count}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
        </TabsContent>

        {/* Вкладка: Детали */}
        <TabsContent value="details" className="space-y-6">
          {details && (
            <>
              {/* Языки */}
              <Card>
                <CardHeader>
                  <CardTitle>Taʼlim tillari</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Asosiy: </span>
                      <span className="text-muted-foreground">
                        {languageLabels[details.primary_language] || details.primary_language}
                      </span>
                    </div>
                    {details.additional_languages && details.additional_languages.length > 0 && (
                      <div>
                        <span className="font-medium">Qoʻshimcha: </span>
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
                    <CardTitle>Taʼlim dasturi</CardTitle>
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

              {/* Xizmatlar */}
              <Card>
                <CardHeader>
                  <CardTitle>Xizmatlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={details.has_transport ? 'text-green-600' : 'text-gray-400'}>
                          {details.has_transport ? '✓' : '✗'}
                        </span>
                        <span>Transport</span>
                      </div>
                      {details.transport_fee_monthly && (
                        <span className="text-sm text-muted-foreground">
                          {details.transport_fee_monthly.toLocaleString('ru-RU')} soʻm/oy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={details.has_meals ? 'text-green-600' : 'text-gray-400'}>
                          {details.has_meals ? '✓' : '✗'}
                        </span>
                        <span>Ovqatlanish</span>
                      </div>
                      {details.meal_fee_monthly && (
                        <span className="text-sm text-muted-foreground">
                          {details.meal_fee_monthly.toLocaleString('ru-RU')} soʻm/oy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={details.has_extended_day ? 'text-green-600' : 'text-gray-400'}>
                          {details.has_extended_day ? '✓' : '✗'}
                        </span>
                        <span>Kengaytirilgan kun</span>
                      </div>
                      {details.extended_day_until && (
                        <span className="text-sm text-muted-foreground">gacha {details.extended_day_until}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Финансовые детали */}
              {(details.entrance_fee ||
                details.textbook_fee_yearly ||
                details.uniform_fee) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Qoʻshimcha xarajatlar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {details.entrance_fee && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kirish toʻlovi:</span>
                        <span className="font-medium">
                          {details.entrance_fee.toLocaleString('ru-RU')} сум
                        </span>
                      </div>
                    )}
                    {details.textbook_fee_yearly && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Darsliklar (yiliga):</span>
                        <span className="font-medium">
                          {details.textbook_fee_yearly.toLocaleString('ru-RU')} сум
                        </span>
                      </div>
                    )}
                    {details.uniform_fee && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forma:</span>
                        <span className="font-medium">
                          {details.uniform_fee.toLocaleString('ru-RU')} сум
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Qoʻshimcha taʼlim */}
              {(details.extracurricular_activities?.length ||
                details.clubs?.length ||
                details.sports_sections?.length) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Qoʻshimcha taʼlim</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {details.clubs && details.clubs.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium">Klublar</h4>
                        <div className="flex flex-wrap gap-2">
                          {details.clubs.map((club: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {club}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.sports_sections && details.sports_sections.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium">Sport boʻlimlari</h4>
                        <div className="flex flex-wrap gap-2">
                          {details.sports_sections.map((sport: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.extracurricular_activities && details.extracurricular_activities.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium">Doʻkonlar va boʻlimlar</h4>
                        <div className="flex flex-wrap gap-2">
                          {details.extracurricular_activities.map((activity: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Документы и лицензии */}
              {(details.license_number ||
                details.license_date ||
                details.license_valid_until ||
                details.license_authority ||
                details.has_international_accreditation ||
                details.accreditation_body) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hujjatlar va litsenziyalar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {details.license_number && (
                      <div>
                        <span className="font-medium">Litsenziya №: </span>
                        <span className="text-muted-foreground">{details.license_number}</span>
                      </div>
                    )}
                    {details.license_authority && (
                      <div>
                        <span className="font-medium">Berilgan: </span>
                        <span className="text-muted-foreground">{details.license_authority}</span>
                      </div>
                    )}
                    {details.license_date && (
                      <div>
                        <span className="font-medium">Haта выдачи: </span>
                        <span className="text-muted-foreground">
                          {new Date(details.license_date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                    {details.license_valid_until && (
                      <div>
                        <span className="font-medium">Amal qiladi: </span>
                        <span className="text-muted-foreground">
                          {new Date(details.license_valid_until).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                    {details.has_international_accreditation && details.accreditation_body && (
                      <div>
                        <span className="font-medium">Xalqaro akkreditatsiya: </span>
                        <span className="text-muted-foreground">{details.accreditation_body}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Вкладка: Infratuzilma */}
        <TabsContent value="infrastructure" className="space-y-6">
          {details && (
            <>
              {/* Umumiy maʼlumot */}
              {(details.school_area_sqm || details.classrooms_count) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Umumiy maʼlumot</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {details.school_area_sqm && (
                      <div>
                        <span className="font-medium">Maktab maydoni: </span>
                        <span className="text-muted-foreground">
                          {details.school_area_sqm.toLocaleString('ru-RU')} m²
                        </span>
                      </div>
                    )}
                    {details.classrooms_count && (
                      <div>
                        <span className="font-medium">Sinflar soni: </span>
                        <span className="text-muted-foreground">{details.classrooms_count}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sport infratuzilmasi */}
              {(details.has_gym ||
                details.has_swimming_pool ||
                details.has_football_field) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sport infratuzilmasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      {details.has_gym && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Sport zali</span>
                        </div>
                      )}
                      {details.has_swimming_pool && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Suzish havzasi</span>
                        </div>
                      )}
                      {details.has_football_field && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Futbol maydoni</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Taʼlim xonalari */}
              {(details.has_library ||
                details.has_computer_lab ||
                details.has_science_labs ||
                details.has_medical_room ||
                details.has_cafeteria) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Taʼlim xonalari</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      {details.has_library && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Kutubxona</span>
                        </div>
                      )}
                      {details.has_computer_lab && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Kompyuter xonasi</span>
                        </div>
                      )}
                      {details.has_science_labs && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Laboratoriyalar</span>
                        </div>
                      )}
                      {details.has_medical_room && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Shifoxona</span>
                        </div>
                      )}
                      {details.has_cafeteria && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Oshxona</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Безопасность */}
              {(details.has_security_24_7 || details.has_cctv || details.has_psychologist) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Xavfsizlik va qoʻllab-quvvatlash</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      {details.has_security_24_7 && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>24/7 qoʻriqchi</span>
                        </div>
                      )}
                      {details.has_cctv && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Video kuzatuv</span>
                        </div>
                      )}
                      {details.has_psychologist && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Psixolog</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Вкладка: Aloqa */}
        <TabsContent value="contacts" className="space-y-6">
          {/* Filiallar (если есть) */}
          {branches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Filiallar</CardTitle>
                <CardDescription>
                  Tarmoqning boshqa filiallari {school.name}
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
                                {branchDetails.fee_monthly_min.toLocaleString('ru-RU')} soʻm/oy dan
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">Filial</Badge>
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
              <CardTitle>Aloqa maʼlumotlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {school.address && (
                <div>
                  <span className="font-medium">Manzil: </span>
                  <span className="text-muted-foreground">{school.address}</span>
                </div>
              )}

              {/* Телефоны */}
              {(school.phone || school.phone_secondary || school.phone_admission) && (
                <div className="space-y-2">
                  {school.phone && (
                    <div>
                      <span className="font-medium">Telefon: </span>
                      <a
                        href={`tel:${school.phone}`}
                        className="text-primary hover:underline"
                      >
                        {school.phone}
                      </a>
                    </div>
                  )}
                  {school.phone_secondary && (
                    <div>
                      <span className="font-medium">Qoʻshimcha: </span>
                      <a
                        href={`tel:${school.phone_secondary}`}
                        className="text-primary hover:underline"
                      >
                        {school.phone_secondary}
                      </a>
                    </div>
                  )}
                  {school.phone_admission && (
                    <div>
                      <span className="font-medium">Qabul komissiyasi: </span>
                      <a
                        href={`tel:${school.phone_admission}`}
                        className="text-primary hover:underline"
                      >
                        {school.phone_admission}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Email */}
              {(school.email || school.email_admission) && (
                <div className="space-y-2">
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
                  {school.email_admission && (
                    <div>
                      <span className="font-medium">Qabul komissiyasi: </span>
                      <a
                        href={`mailto:${school.email_admission}`}
                        className="text-primary hover:underline"
                      >
                        {school.email_admission}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {school.website && (
                <div>
                  <span className="font-medium">Sayt: </span>
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

              {school.telegram && (
                <div>
                  <span className="font-medium">Telegram: </span>
                  <a
                    href={`https://t.me/${school.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {school.telegram}
                  </a>
                </div>
              )}

              {/* Социальные сети */}
              {(school.instagram ||
                school.telegram_channel ||
                school.youtube ||
                school.facebook) && (
                <div className="space-y-2">
                  <div className="font-medium">Ijtimoiy tarmoqlar:</div>
                  <div className="flex flex-wrap gap-3">
                    {school.instagram && (
                      <a
                        href={`https://instagram.com/${school.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Instagram
                      </a>
                    )}
                    {school.telegram_channel && (
                      <a
                        href={`https://t.me/${school.telegram_channel.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Telegram kanal
                      </a>
                    )}
                    {school.youtube && (
                      <a
                        href={`https://youtube.com/${school.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        YouTube
                      </a>
                    )}
                    {school.facebook && (
                      <a
                        href={`https://facebook.com/${school.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Карты */}
              {(school.google_maps_url || school.yandex_maps_url || (school.lat && school.lng)) && (
                <div className="space-y-2">
                  <div className="font-medium">Xarita:</div>
                  <div className="flex flex-wrap gap-3">
                    {school.google_maps_url && (
                      <a
                        href={school.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Maps
                      </a>
                    )}
                    {school.yandex_maps_url && (
                      <a
                        href={school.yandex_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Яндекс Карты
                      </a>
                    )}
                    {school.lat && school.lng && !school.google_maps_url && !school.yandex_maps_url && (
                      <a
                        href={`https://www.google.com/maps?q=${school.lat},${school.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Xaritada ochish
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}

