/**
 * Функции для получения количества школ по регионам
 * Используется кеширование для оптимизации производительности
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Создать анонимный Supabase клиент для публичных запросов (без cookies)
 * Используется для серверных запросов, где не нужна аутентификация
 */
function createAnonymousClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Получить количество школ по каждому региону
 * Использует кеширование для оптимизации производительности
 */
export async function getRegionCounts(): Promise<Map<number, number>> {
  const supabase = createAnonymousClient();
  
  // Оптимизированный запрос: получаем только region_id для опубликованных школ
  // Используем type assertion, так как поле может быть в БД, но не в типах
  const { data, error } = await supabase
    .from('organizations')
    .select('region_id')
    .eq('org_type', 'school')
    .in('status', ['active', 'published']);

  if (error) {
    console.error('Error fetching region counts:', error);
    return new Map<number, number>();
  }

  // Группируем и считаем количество школ для каждого региона
  const countMap = new Map<number, number>();
  
  if (data && data.length > 0) {
    // Используем type assertion для работы с region_id, который может быть в БД
    data.forEach((org: any) => {
      const regionId = (org as { region_id?: number | null }).region_id;
      if (regionId !== null && regionId !== undefined && typeof regionId === 'number') {
        countMap.set(
          regionId,
          (countMap.get(regionId) || 0) + 1
        );
      }
    });
  }

  return countMap;
}

/**
 * Получить общее количество школ в Узбекистане
 */
export async function getTotalSchoolCount(): Promise<number> {
  // Для API route не используем unstable_cache, кеширование будет на уровне API
  const supabase = createAnonymousClient();
  
  const { count, error } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('org_type', 'school')
    .in('status', ['active', 'published']);

  if (error) {
    console.error('Error fetching total school count:', error);
    return 0;
  }

  return count || 0;
}

