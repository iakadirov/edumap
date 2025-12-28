import { getSchoolsWithFilters, type SortOption, type PaginatedSchoolsResult } from '@/lib/supabase/queries';
import { SchoolCard } from '@/components/schools/SchoolCard';
import { SortControl } from '@/components/schools/SortControl';
import { Pagination } from '@/components/schools/Pagination';

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
    page?: string;
  };
}

export async function SchoolsList({ params }: SchoolsListProps) {
  let result: PaginatedSchoolsResult;

  try {
    const regionId = params.region ? parseInt(params.region, 10) : undefined;
    const page = params.page ? parseInt(params.page, 10) : 1;

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
      page: isNaN(page) ? 1 : page,
    };

    result = await getSchoolsWithFilters(filters);
  } catch (error) {
    console.error('Error loading schools:', error);
    // В случае ошибки показываем пустой результат
    result = {
      schools: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const { schools, totalCount, currentPage, totalPages, hasNextPage, hasPrevPage } = result;

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
          Topilgan maktablar: <span className="font-semibold text-foreground">{totalCount}</span>
        </p>
        <SortControl currentSort={params.sort as SortOption} />
      </div>

      <div className="flex flex-col gap-5 w-full">
        {schools.map((school) => (
          <div key={school.id} className="w-full">
            <SchoolCard school={school} />
          </div>
        ))}
      </div>

      {/* Пагинация */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
