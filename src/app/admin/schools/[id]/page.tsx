import { createClient } from '@/lib/supabase/server';
import { SchoolProfileHeader } from '@/components/admin/schools/SchoolProfileHeader';
import { SectionsGrid } from '@/components/admin/schools/SectionCard';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';

// Админ-панель всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    id: 'basic',
    name: '📝 Базовая информация',
    description: 'Название, описание, контакты, адрес, цены',
    href: '/admin/schools/[id]/basic',
    level: 'required' as const,
  },
  {
    id: 'education',
    name: '📚 Образовательная программа',
    description: 'Программа, языки, предметы, кружки',
    href: '/admin/schools/[id]/education',
    level: 'important' as const,
  },
  {
    id: 'teachers',
    name: '👨‍🏫 Педагогический состав',
    description: 'Учителя, квалификация, руководство',
    href: '/admin/schools/[id]/teachers',
    level: 'important' as const,
  },
  {
    id: 'infrastructure',
    name: '🏗 Инфраструктура',
    description: 'Здание, классы, спорт, IT, безопасность',
    href: '/admin/schools/[id]/infrastructure',
    level: 'important' as const,
  },
  {
    id: 'services',
    name: '🍽 Услуги и сервисы',
    description: 'Питание, транспорт, продлёнка',
    href: '/admin/schools/[id]/services',
    level: 'important' as const,
  },
  {
    id: 'results',
    name: '🏆 Результаты и достижения',
    description: 'Выпускники, экзамены, олимпиады',
    href: '/admin/schools/[id]/results',
    level: 'full' as const,
  },
  {
    id: 'admission',
    name: '📋 Поступление и приём',
    description: 'Требования, документы, процесс',
    href: '/admin/schools/[id]/admission',
    level: 'full' as const,
  },
  {
    id: 'finance',
    name: '💰 Финансы (подробно)',
    description: 'Скидки, стипендии, доп. расходы',
    href: '/admin/schools/[id]/finance',
    level: 'full' as const,
  },
  {
    id: 'documents',
    name: '📄 Документы и лицензии',
    description: 'Лицензия, аккредитации',
    href: '/admin/schools/[id]/documents',
    level: 'full' as const,
  },
  {
    id: 'photos',
    name: '🖼 Фотографии',
    description: 'Рекомендуем минимум 10 фото',
    href: '/admin/schools/[id]/photos',
    level: 'media' as const,
  },
  {
    id: 'videos',
    name: '🎥 Видео',
    description: 'Видеоролики о школе',
    href: '/admin/schools/[id]/videos',
    level: 'media' as const,
  },
];

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore(); // Отключаем кэширование для админ-панели
  const { id } = await params;
  const supabase = await createClient();

  // Получаем школу с деталями
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (orgError || !organization) {
    notFound();
  }

  // Получаем прогресс разделов
  const { data: progressData, error: progressError } = await (supabase as any)
    .from('school_sections_progress')
    .select('section, completeness')
    .eq('organization_id', id);

  if (progressError) {
    console.error('Error fetching progress:', progressError);
  }

  console.log('[EditSchoolPage] Progress data:', progressData);

  const progressMap = new Map<string, number>(
    progressData?.map((p: any) => [p.section, p.completeness]) || []
  );

  console.log('[EditSchoolPage] Progress map:', Array.from(progressMap.entries()));

  // Вычисляем общий прогресс
  const overallProgress =
    progressData && progressData.length > 0
      ? Math.round(
          progressData.reduce((sum: number, p: any) => sum + p.completeness, 0) /
            progressData.length
        )
      : 0;

  console.log('[EditSchoolPage] Overall progress:', overallProgress);

  // Формируем секции с прогрессом
  const sectionsWithProgress = SECTIONS.map((section) => ({
    ...section,
    href: section.href.replace('[id]', id),
    completeness: progressMap.get(section.id) ?? 0,
  }));

  // Группируем по уровням
  const requiredSections = sectionsWithProgress.filter((s) => s.level === 'required');
  const importantSections = sectionsWithProgress.filter((s) => s.level === 'important');
  const fullSections = sectionsWithProgress.filter((s) => s.level === 'full');
  const mediaSections = sectionsWithProgress.filter((s) => s.level === 'media');

  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-6">
        <SchoolProfileHeader
          school={organization}
          overallProgress={overallProgress}
          basePath="/admin"
        />

        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold">РАЗДЕЛЫ ПРОФИЛЯ</h2>

          {requiredSections.length > 0 && (
            <SectionsGrid sections={requiredSections} schoolId={id} level="required" />
          )}
          {importantSections.length > 0 && (
            <SectionsGrid sections={importantSections} schoolId={id} level="important" />
          )}
          {fullSections.length > 0 && (
            <SectionsGrid sections={fullSections} schoolId={id} level="full" />
          )}
          {mediaSections.length > 0 && (
            <SectionsGrid sections={mediaSections} schoolId={id} level="media" />
          )}
        </div>
      </div>
    </div>
  );
}
