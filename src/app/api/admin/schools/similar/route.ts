import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import type { OrganizationRow } from '@/types/organization';

/**
 * Поиск похожих школ по названию
 * Использует схожесть строк (80% порог)
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['super_admin', 'admin', 'school_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = '';
    try {
      const url = new URL(request.url);
      query = url.searchParams.get('q') || '';
    } catch (error) {
      console.error('Error parsing URL:', error);
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }

    if (!query || query.length < 3) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();

    // Получаем все школы
    const { data: schools, error } = await supabase
      .from('organizations')
      .select('id, name_uz, name_ru, name, slug, logo_url, is_verified')
      .not('name_uz', 'is', null)
      .limit(100); // Ограничиваем для производительности

    if (error) {
      console.error('Error fetching schools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch schools' },
        { status: 500 }
      );
    }

    if (!schools || schools.length === 0) {
      return NextResponse.json([]);
    }

    // Явно указываем тип для результата запроса
    const typedSchools = schools as OrganizationRow[];

    // Функция для вычисления схожести строк (простой алгоритм Левенштейна)
    const similarity = (str1: string, str2: string): number => {
      const s1 = str1.toLowerCase().trim();
      const s2 = str2.toLowerCase().trim();
      
      if (s1 === s2) return 1;
      if (s1.length === 0 || s2.length === 0) return 0;

      // Простая проверка на вхождение
      if (s1.includes(s2) || s2.includes(s1)) {
        return 0.9;
      }

      // Вычисляем расстояние Левенштейна
      const matrix: number[][] = [];
      for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
          if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      const distance = matrix[s2.length][s1.length];
      const maxLength = Math.max(s1.length, s2.length);
      return 1 - distance / maxLength;
    };

    // Фильтруем школы по схожести (80% = 0.8)
    const queryLower = query.toLowerCase().trim();
    const similarSchools = typedSchools
      .map((school) => {
        const name = school.name_uz || school.name_ru || school.name || '';
        const sim = similarity(queryLower, name.toLowerCase());
        return { school, similarity: sim };
      })
      .filter((item) => item.similarity >= 0.8)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10) // Топ 10 похожих
      .map((item) => ({
        id: item.school.id,
        name: item.school.name_uz || item.school.name_ru || item.school.name,
        slug: item.school.slug,
        logo_url: item.school.logo_url,
        is_verified: item.school.is_verified,
        similarity: Math.round(item.similarity * 100),
      }));

    return NextResponse.json(similarSchools);
  } catch (error) {
    console.error('Error in GET /api/admin/schools/similar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

