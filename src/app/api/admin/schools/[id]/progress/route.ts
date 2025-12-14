import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

/**
 * GET /api/admin/schools/[id]/progress
 * Получить общий прогресс заполнения профиля школы
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
    const { data: progress, error: progressError } = await supabase
      .from('school_sections_progress')
      .select('*')
      .eq('organization_id', id);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    // Вычисляем общий прогресс как среднее арифметическое всех разделов
    const sections = progress || [];
    const totalCompleteness =
      sections.reduce((sum, section) => sum + (section.completeness || 0), 0) /
      Math.max(sections.length, 1);

    const overallProgress = Math.round(totalCompleteness);

    return NextResponse.json({
      overall: overallProgress,
      sections: sections.reduce((acc: any, section) => {
        acc[section.section] = section.completeness;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error in GET /api/admin/schools/[id]/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

