import { getActiveSchools, getSchoolsWithFilters } from '@/lib/supabase/queries';
import { SchoolCard } from '@/components/schools/SchoolCard';

interface SchoolsListProps {
  params: {
    district?: string;
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string;
    curriculum?: string;
  };
}

export async function SchoolsList({ params }: SchoolsListProps) {
  // Проверяем, есть ли фильтры в URL
  const hasFilters = 
    params.district ||
    params.city ||
    params.school_type ||
    params.price_min ||
    params.price_max ||
    params.language ||
    params.curriculum;

  let schools;
  
  if (hasFilters) {
    // Используем фильтры
    const filters = {
      district: params.district,
      city: params.city,
      school_type: params.school_type,
      price_min: params.price_min ? Number(params.price_min) : undefined,
      price_max: params.price_max ? Number(params.price_max) : undefined,
      language: params.language,
      curriculum: params.curriculum ? params.curriculum.split(',') : undefined,
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
      <p className="text-muted-foreground mb-6">
        Topilgan maktablar: <span className="font-semibold text-foreground">{schools.length}</span>
      </p>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {schools.map((school: any) => (
          <SchoolCard key={school.id} school={school} />
        ))}
      </div>
    </div>
  );
}

