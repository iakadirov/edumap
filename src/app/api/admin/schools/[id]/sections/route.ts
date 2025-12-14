import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

/**
 * GET /api/admin/schools/[id]/sections
 * Получить все разделы школы с прогрессом
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Проверка прав доступа
    const hasAccess = await canEditSchool(
      user.role,
      user.organization_id,
      id,
      user.id,
      supabase
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Получаем прогресс всех разделов
    const { data: progress, error: progressError } = await (supabase as any)
      .from('school_sections_progress')
      .select('*')
      .eq('organization_id', id)
      .order('section');

    if (progressError) {
      console.error('Error fetching sections progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch sections progress' },
        { status: 500 }
      );
    }

    // Формируем объект с прогрессом по разделам
    const sectionsMap: Record<string, any> = {};
    const allSections = [
      'basic',
      'education',
      'teachers',
      'infrastructure',
      'services',
      'results',
      'admission',
      'finance',
      'documents',
      'photos',
      'videos',
    ];

    allSections.forEach((section) => {
      const sectionProgress = progress?.find((p) => p.section === section);
      sectionsMap[section] = {
        section,
        completeness: sectionProgress?.completeness || 0,
        last_updated_at: sectionProgress?.last_updated_at || null,
      };
    });

    return NextResponse.json({
      sections: sectionsMap,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/schools/[id]/sections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

