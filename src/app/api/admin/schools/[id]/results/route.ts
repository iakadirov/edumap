import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

/**
 * POST /api/admin/schools/[id]/results
 * Создать новую запись результатов
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
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

    const { data: result, error: resultError } = await (supabase as any)
      .from('school_results')
      .insert({
        organization_id: id,
        year: body.year,
        total_graduates: body.total_graduates || null,
        graduates_to_universities: body.graduates_to_universities || null,
        graduates_on_grants: body.graduates_on_grants || null,
        graduates_to_top_uz_universities: body.graduates_to_top_uz_universities || null,
        graduates_to_foreign_universities: body.graduates_to_foreign_universities || null,
        top_universities_uz: body.top_universities_uz || null,
        foreign_universities: body.foreign_universities || null,
        avg_dtm_score: body.avg_dtm_score || null,
        avg_ielts_score: body.avg_ielts_score || null,
        avg_sat_score: body.avg_sat_score || null,
        students_with_ielts_7plus: body.students_with_ielts_7plus || null,
        students_with_ielts_8plus: body.students_with_ielts_8plus || null,
        olympiad_medals_international: body.olympiad_medals_international || 0,
        olympiad_medals_national: body.olympiad_medals_national || 0,
        olympiad_medals_city: body.olympiad_medals_city || 0,
        olympiad_subjects: body.olympiad_subjects || null,
        school_awards: body.school_awards || null,
      })
      .select()
      .single();

    if (resultError) {
      console.error('Error creating result:', resultError);
      return NextResponse.json(
        { error: 'Failed to create result: ' + resultError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in POST /api/admin/schools/[id]/results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/schools/[id]/results
 * Обновить существующую запись результатов
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
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

    // Проверяем существование записи для данного года
    const { data: existing } = await (supabase as any)
      .from('school_results')
      .select('id')
      .eq('organization_id', id)
      .eq('year', body.year)
      .single();

    if (!existing) {
      // Если записи нет, создаем новую (upsert через insert с конфликтом)
      const { data: result, error: resultError } = await (supabase as any)
        .from('school_results')
        .insert({
          organization_id: id,
          year: body.year,
          total_graduates: body.total_graduates || null,
          graduates_to_universities: body.graduates_to_universities || null,
          graduates_on_grants: body.graduates_on_grants || null,
          graduates_to_top_uz_universities: body.graduates_to_top_uz_universities || null,
          graduates_to_foreign_universities: body.graduates_to_foreign_universities || null,
          top_universities_uz: body.top_universities_uz || null,
          foreign_universities: body.foreign_universities || null,
          avg_dtm_score: body.avg_dtm_score || null,
          avg_ielts_score: body.avg_ielts_score || null,
          avg_sat_score: body.avg_sat_score || null,
          students_with_ielts_7plus: body.students_with_ielts_7plus || null,
          students_with_ielts_8plus: body.students_with_ielts_8plus || null,
          olympiad_medals_international: body.olympiad_medals_international || 0,
          olympiad_medals_national: body.olympiad_medals_national || 0,
          olympiad_medals_city: body.olympiad_medals_city || 0,
          olympiad_subjects: body.olympiad_subjects || null,
          school_awards: body.school_awards || null,
        })
        .select()
        .single();

      if (resultError) {
        console.error('Error creating result:', resultError);
        return NextResponse.json(
          { error: 'Failed to create result: ' + resultError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, result });
    }

    // Обновляем существующую запись
    const { data: result, error: resultError } = await (supabase as any)
      .from('school_results')
      .update({
        total_graduates: body.total_graduates || null,
        graduates_to_universities: body.graduates_to_universities || null,
        graduates_on_grants: body.graduates_on_grants || null,
        graduates_to_top_uz_universities: body.graduates_to_top_uz_universities || null,
        graduates_to_foreign_universities: body.graduates_to_foreign_universities || null,
        top_universities_uz: body.top_universities_uz || null,
        foreign_universities: body.foreign_universities || null,
        avg_dtm_score: body.avg_dtm_score || null,
        avg_ielts_score: body.avg_ielts_score || null,
        avg_sat_score: body.avg_sat_score || null,
        students_with_ielts_7plus: body.students_with_ielts_7plus || null,
        students_with_ielts_8plus: body.students_with_ielts_8plus || null,
        olympiad_medals_international: body.olympiad_medals_international || 0,
        olympiad_medals_national: body.olympiad_medals_national || 0,
        olympiad_medals_city: body.olympiad_medals_city || 0,
        olympiad_subjects: body.olympiad_subjects || null,
        school_awards: body.school_awards || null,
      })
      .eq('organization_id', id)
      .eq('year', body.year)
      .select()
      .single();

    if (resultError) {
      console.error('Error updating result:', resultError);
      return NextResponse.json(
        { error: 'Failed to update result: ' + resultError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in PUT /api/admin/schools/[id]/results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

