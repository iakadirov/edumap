import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

/**
 * PUT /api/admin/schools/[id]/staff/[staffId]
 * Обновить сотрудника
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, staffId } = await params;
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

    // Проверяем, что сотрудник принадлежит школе
    const { data: existingStaff } = await (supabase as any)
      .from('school_staff')
      .select('id')
      .eq('id', staffId)
      .eq('organization_id', id)
      .single();

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    const { data: staff, error: staffError } = await (supabase as any)
      .from('school_staff')
      .update({
        name: body.name,
        position: body.position,
        photo_url: body.photo_url || null,
        experience_years: body.experience_years || null,
        education: body.education || null,
        certifications: body.certifications || null,
        bio: body.bio || null,
      })
      .eq('id', staffId)
      .select()
      .single();

    if (staffError) {
      console.error('Error updating staff:', staffError);
      return NextResponse.json(
        { error: 'Failed to update staff' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error(
      'Error in PUT /api/admin/schools/[id]/staff/[staffId]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/schools/[id]/staff/[staffId]
 * Удалить сотрудника
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, staffId } = await params;
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

    // Проверяем, что сотрудник принадлежит школе
    const { data: existingStaff } = await (supabase as any)
      .from('school_staff')
      .select('id')
      .eq('id', staffId)
      .eq('organization_id', id)
      .single();

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await (supabase as any)
      .from('school_staff')
      .delete()
      .eq('id', staffId);

    if (deleteError) {
      console.error('Error deleting staff:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete staff' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in DELETE /api/admin/schools/[id]/staff/[staffId]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

