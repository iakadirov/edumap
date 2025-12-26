import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/search
 * Быстрый поиск школ по названию
 * 
 * Query параметры:
 *   - q: поисковый запрос
 *   - limit: количество результатов (по умолчанию 5)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createClient();
    
    // Ищем школы по названию (name, name_uz, name_ru)
    const searchPattern = `%${query}%`;
    const { data: schools, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        name_uz,
        slug,
        city,
        district,
        logo_url,
        overall_rating,
        school_details (
          fee_monthly_min,
          fee_monthly_max
        )
      `)
      .eq('org_type', 'school')
      .in('status', ['active', 'published'])
      .or(`name.ilike.${searchPattern},name_uz.ilike.${searchPattern},name_ru.ilike.${searchPattern}`)
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Форматируем результаты
    const results = (schools || []).map((school) => {
      const details = Array.isArray(school.school_details) 
        ? school.school_details[0] 
        : school.school_details;
      
      return {
        id: school.id,
        name: school.name_uz || school.name,
        slug: school.slug,
        city: school.city,
        district: school.district,
        logo_url: school.logo_url,
        rating: school.overall_rating,
        priceRange: details
          ? `${details.fee_monthly_min || 0} - ${details.fee_monthly_max || 0}`
          : null,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

