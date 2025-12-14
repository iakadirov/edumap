import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

const VALID_SECTIONS = [
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
] as const;

type Section = (typeof VALID_SECTIONS)[number];

/**
 * GET /api/admin/schools/[id]/sections/[section]
 * Получить данные конкретного раздела
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; section: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, section } = await params;

    if (!VALID_SECTIONS.includes(section as Section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

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

    // Получаем прогресс раздела
    const { data: progress } = await (supabase as any)
      .from('school_sections_progress')
      .select('*')
      .eq('organization_id', id)
      .eq('section', section)
      .single();

    // Получаем данные школы (базовые данные нужны для всех разделов)
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    const { data: schoolDetails } = await supabase
      .from('school_details')
      .select('*')
      .eq('organization_id', id)
      .single();

    // В зависимости от раздела получаем дополнительные данные
    let sectionData: any = {};

    if (section === 'teachers') {
      const { data: staff } = await (supabase as any)
        .from('school_staff')
        .select('*')
        .eq('organization_id', id)
        .order('position', { ascending: true });
      sectionData.staff = staff || [];
    }

    if (section === 'results') {
      const { data: results } = await (supabase as any)
        .from('school_results')
        .select('*')
        .eq('organization_id', id)
        .order('year', { ascending: false });
      sectionData.results = results || [];
    }

    if (section === 'photos' || section === 'videos') {
      const mediaType = section === 'photos' ? 'photo' : 'video';
      const { data: media } = await (supabase as any)
        .from('school_media')
        .select('*')
        .eq('organization_id', id)
        .eq('type', mediaType)
        .order('sort_order', { ascending: true });
      sectionData.media = media || [];
    }

    return NextResponse.json({
      section,
      progress: progress || { completeness: 0 },
      organization: organization || null,
      schoolDetails: schoolDetails || null,
      data: sectionData,
    });
  } catch (error) {
    console.error(
      'Error in GET /api/admin/schools/[id]/sections/[section]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/schools/[id]/sections/[section]
 * Обновить данные раздела
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; section: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, section } = await params;
    const body = await request.json();

    if (!VALID_SECTIONS.includes(section as Section)) {
      return NextResponse.json(
        { error: 'Invalid section' },
        { status: 400 }
      );
    }

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

    // Обновляем данные в зависимости от раздела
    // Это упрощенная версия - в реальности нужно вызывать соответствующие функции обновления
    // для каждого раздела

    // Обновляем прогресс раздела (если передан completeness)
    if (body.completeness !== undefined) {
      const { error: progressError } = await (supabase as any)
        .from('school_sections_progress')
        .upsert({
          organization_id: id,
          section,
          completeness: body.completeness,
          last_updated_at: new Date().toISOString(),
        });

      if (progressError) {
        console.error('Error updating progress:', progressError);
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      section,
      message: 'Section updated successfully',
    });
  } catch (error) {
    console.error(
      'Error in PATCH /api/admin/schools/[id]/sections/[section]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

