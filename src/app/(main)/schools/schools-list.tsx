import { getActiveSchools, getSchoolsWithFilters, type SortOption } from '@/lib/supabase/queries';
import { SchoolCard } from '@/components/schools/SchoolCard';
import { SortControl } from '@/components/schools/SortControl';

interface SchoolsListProps {
  params: {
    region?: string; // ID области
    district?: string; // comma-separated для множественного выбора
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string; // comma-separated
    curriculum?: string; // comma-separated
    grade?: string;
    rating_min?: string;
    has_transport?: string;
    has_meals?: string;
    has_extended_day?: string;
    sort?: SortOption;
  };
}

export async function SchoolsList({ params }: SchoolsListProps) {
  // Проверяем, есть ли фильтры в URL
  const hasFilters = 
    params.region ||
    params.district ||
    params.city ||
    params.school_type ||
    params.price_min ||
    params.price_max ||
    params.language ||
    params.curriculum ||
    params.grade ||
    params.rating_min ||
    params.has_transport ||
    params.has_meals ||
    params.has_extended_day;

  let schools;
  
  if (hasFilters) {
    // Используем фильтры
    const regionId = params.region ? parseInt(params.region, 10) : undefined;
    const filters = {
      region: isNaN(regionId as number) ? undefined : regionId,
      districts: params.district ? params.district.split(',').filter(Boolean) : undefined,
      city: params.city,
      school_type: params.school_type,
      price_min: params.price_min ? Number(params.price_min) : undefined,
      price_max: params.price_max ? Number(params.price_max) : undefined,
      language: params.language ? params.language.split(',').filter(Boolean) : undefined,
      curriculum: params.curriculum ? params.curriculum.split(',').filter(Boolean) : undefined,
      grade: params.grade,
      rating_min: params.rating_min ? Number(params.rating_min) : undefined,
      has_transport: params.has_transport === 'true',
      has_meals: params.has_meals === 'true',
      has_extended_day: params.has_extended_day === 'true',
      sort: params.sort || 'rating_desc',
    };
    schools = await getSchoolsWithFilters(filters);
  } else {
    // Получаем все школы
    schools = await getActiveSchools();
  }

  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Maktablar topilmadi.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок с количеством и сортировкой */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Topilgan maktablar: <span className="font-semibold text-foreground">{schools.length}</span>
        </p>
        <SortControl currentSort={params.sort as SortOption} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {schools.map((school: any) => (
          <SchoolCard key={school.id} school={school} />
        ))}
      </div>
    </div>
  );
}

