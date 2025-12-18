import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * API endpoint для получения статистики школ
 * Оптимизирован для быстрого получения данных одним запросом
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !['super_admin', 'admin', 'moderator'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Получаем статистику одним запросом с использованием агрегации
    const { data, error } = await supabase
      .from('organizations')
      .select('status')
      .eq('org_type', 'school');

    if (error) {
      console.error('Error fetching stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }

    // Подсчитываем статистику на сервере
    const stats = {
      total: data?.length || 0,
      published: data?.filter((s) => s.status === 'published').length || 0,
      pending: data?.filter((s) => s.status === 'pending').length || 0,
      draft: data?.filter((s) => s.status === 'draft').length || 0,
      rejected: data?.filter((s) => s.status === 'rejected').length || 0,
      suspended: data?.filter((s) => s.status === 'suspended').length || 0,
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

