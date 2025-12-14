import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

/**
 * PATCH /api/admin/schools/[id]/media/[mediaId]
 * Обновить медиа-файл
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, mediaId } = await params;
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

    // Проверяем, что медиа принадлежит школе
    const { data: media, error: mediaError } = await supabase
      .from('school_media')
      .select('*')
      .eq('id', mediaId)
      .eq('organization_id', id)
      .single();

    if (mediaError || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { category, caption, is_cover, sort_order } = body;

    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (caption !== undefined) updateData.caption = caption;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Если устанавливаем обложку, снимаем с других
    if (is_cover === true) {
      await (supabase as any)
        .from('school_media')
        .update({ is_cover: false })
        .eq('organization_id', id)
        .eq('is_cover', true)
        .neq('id', mediaId);
      updateData.is_cover = true;
    } else if (is_cover === false) {
      updateData.is_cover = false;
    }

    const { data: updatedMedia, error: updateError } = await (supabase as any)
      .from('school_media')
      .update(updateData)
      .eq('id', mediaId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating media:', updateError);
      return NextResponse.json(
        { error: 'Failed to update media' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, media: updatedMedia });
  } catch (error) {
    console.error(
      'Error in PATCH /api/admin/schools/[id]/media/[mediaId]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/schools/[id]/media/[mediaId]
 * Удалить медиа-файл
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, mediaId } = await params;
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

    // Проверяем, что медиа принадлежит школе
    const { data: media, error: mediaError } = await (supabase as any)
      .from('school_media')
      .select('*')
      .eq('id', mediaId)
      .eq('organization_id', id)
      .single();

    if (mediaError || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await (supabase as any)
      .from('school_media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) {
      console.error('Error deleting media:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete media' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error in DELETE /api/admin/schools/[id]/media/[mediaId]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

