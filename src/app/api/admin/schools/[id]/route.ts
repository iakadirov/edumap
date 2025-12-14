import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

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
    const { organization, school_details } = body;

    if (!organization || !school_details) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Проверяем существование организации
    const { data: existing, error: checkError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Обновляем организацию
    const { error: orgError } = await supabase
      .from('organizations')
      .update(organization)
      .eq('id', id);

    if (orgError) {
      console.error('Error updating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to update organization: ' + orgError.message },
        { status: 500 }
      );
    }

    // Проверяем существование school_details
    const { data: existingDetails } = await supabase
      .from('school_details')
      .select('id')
      .eq('organization_id', id)
      .single();

    if (existingDetails) {
      // Обновляем существующие детали
      const { error: detailsError } = await supabase
        .from('school_details')
        .update(school_details)
        .eq('organization_id', id);

      if (detailsError) {
        console.error('Error updating school details:', detailsError);
        return NextResponse.json(
          { error: 'Failed to update school details: ' + detailsError.message },
          { status: 500 }
        );
      }
    } else {
      // Создаем новые детали
      const { error: detailsError } = await supabase
        .from('school_details')
        .insert({
          ...school_details,
          organization_id: id,
        });

      if (detailsError) {
        console.error('Error creating school details:', detailsError);
        return NextResponse.json(
          { error: 'Failed to create school details: ' + detailsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/schools/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Только super_admin и admin могут удалять школы
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Удаляем школу (cascade удалит связанные записи)
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting school:', error);
      return NextResponse.json(
        { error: 'Failed to delete school' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/schools/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
