import { NextRequest, NextResponse } from 'next/server';
import { getDistrictsWithCounts } from '@/lib/supabase/queries';

/**
 * API endpoint для получения районов
 * GET /api/districts?region=11
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionIdParam = searchParams.get('region');
    
    const regionId = regionIdParam ? parseInt(regionIdParam, 10) : null;
    
    if (regionIdParam && isNaN(regionId as number)) {
      return NextResponse.json(
        { error: 'Invalid region ID' },
        { status: 400 }
      );
    }

    const districts = await getDistrictsWithCounts(regionId);
    
    // Преобразуем в формат { id, name, name_uz, region_id }
    // getDistrictsWithCounts возвращает id как строку, преобразуем в число
    const formattedDistricts = districts.map((d: any) => {
      const nameUz = d.name_uz || d.name || '';
      return {
        id: typeof d.id === 'string' ? parseInt(d.id, 10) : d.id,
        name: nameUz, // Для обратной совместимости
        name_uz: nameUz,
        region_id: d.region_id,
        count: d.count || 0,
      };
    });
    
    // Возвращаем массив напрямую для удобства использования
    return NextResponse.json(formattedDistricts, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error fetching districts:', error);
    // Возвращаем более детальную информацию об ошибке для отладки
    return NextResponse.json(
      { 
        error: 'Failed to fetch districts',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

