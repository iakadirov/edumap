import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

/**
 * API endpoint для получения списка всех slugs школ
 * GET /api/admin/schools/slugs
 * 
 * Используется для проверки уникальности slug при создании/дублировании школы
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin', 'school_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Получаем все slugs из таблицы organizations
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('slug')
      .not('slug', 'is', null);

    if (error) {
      console.error('Error fetching slugs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch slugs' },
        { status: 500 }
      );
    }

    const slugs = organizations?.map(org => org.slug).filter(Boolean) || [];

    return NextResponse.json({ slugs });
  } catch (error) {
    console.error('Error in GET /api/admin/schools/slugs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

