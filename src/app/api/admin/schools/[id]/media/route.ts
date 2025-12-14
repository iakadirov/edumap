import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

/**
 * POST /api/admin/schools/[id]/media
 * Загрузить медиа-файл
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

    const body = await request.json();
    const { url, type, category, caption, is_cover, sort_order } = body;

    if (!url || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: url, type' },
        { status: 400 }
      );
    }

    if (!['photo', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "photo" or "video"' },
        { status: 400 }
      );
    }

    // Если это обложка, снимаем обложку с других медиа
    if (is_cover) {
      await supabase
        .from('school_media')
        .update({ is_cover: false })
        .eq('organization_id', id)
        .eq('is_cover', true);
    }

    // Вставляем новое медиа
    const { data: media, error: mediaError } = await supabase
      .from('school_media')
      .insert({
        organization_id: id,
        url,
        type,
        category: category || null,
        caption: caption || null,
        is_cover: is_cover || false,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (mediaError) {
      console.error('Error creating media:', mediaError);
      return NextResponse.json(
        { error: 'Failed to create media' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Error in POST /api/admin/schools/[id]/media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/schools/[id]/media
 * Получить все медиа-файлы школы
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'photo' или 'video'

    let query = supabase
      .from('school_media')
      .select('*')
      .eq('organization_id', id);

    if (type && ['photo', 'video'].includes(type)) {
      query = query.eq('type', type);
    }

    query = query.order('sort_order', { ascending: true });

    const { data: media, error: mediaError } = await query;

    if (mediaError) {
      console.error('Error fetching media:', mediaError);
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      );
    }

    return NextResponse.json({ media: media || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/schools/[id]/media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

