import { NextResponse } from 'next/server';
import { getRegionCounts, getTotalSchoolCount } from '@/lib/supabase/region-counts';
import { unstable_cache } from 'next/cache';

/**
 * GET /api/regions/counts
 * Получить количество школ по регионам
 * 
 * Response: {
 *   total: number, // Общее количество школ
 *   byRegion: Record<number, number> // Количество школ по region_id
 * }
 * 
 * Кешируется на 1 час для оптимизации производительности
 */
export async function GET() {
  // Кешируем результат на уровне API route
  const getCachedCounts = unstable_cache(
    async () => {
      try {
        const [countsMap, total] = await Promise.all([
          getRegionCounts(),
          getTotalSchoolCount(),
        ]);

        // Преобразуем Map в объект для JSON
        const byRegion: Record<number, number> = {};
        countsMap.forEach((count, regionId) => {
          byRegion[regionId] = count;
        });

        return {
          total,
          byRegion,
        };
      } catch (error) {
        console.error('Error fetching region counts:', error);
        throw error;
      }
    },
    ['region-counts-api'],
    {
      revalidate: 3600, // Кеш на 1 час
      tags: ['region-counts'],
    }
  );

  try {
    const data = await getCachedCounts();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/regions/counts:', error);
    // Возвращаем пустой результат вместо ошибки, чтобы UI работал
    return NextResponse.json({
      total: 0,
      byRegion: {},
    });
  }
}

