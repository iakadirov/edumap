import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

/**
 * POST /api/admin/schools/[id]/staff
 * Создать нового сотрудника
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

    const { data: staff, error: staffError } = await (supabase as any)
      .from('school_staff')
      .insert({
        organization_id: id,
        name: body.name,
        position: body.position,
        photo_url: body.photo_url || null,
        experience_years: body.experience_years || null,
        education: body.education || null,
        certifications: body.certifications || null,
        bio: body.bio || null,
      })
      .select()
      .single();

    if (staffError) {
      console.error('Error creating staff:', staffError);
      return NextResponse.json(
        { error: 'Failed to create staff' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error('Error in POST /api/admin/schools/[id]/staff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

