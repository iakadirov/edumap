import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    
    // Получаем школу по slug
    const { data: school, error: schoolError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .eq('org_type', 'school')
      .single();
    
    if (schoolError || !school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }
    
    // Получаем медиа
    const { data: media, error } = await supabase
      .from('school_media')
      .select('*')
      .eq('organization_id', school.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching media:', error);
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      );
    }
    
    // Разделяем на фото и видео
    const photos = media
      ?.filter((m) => m.type === 'photo')
      .map((m) => ({
        id: m.id,
        type: 'photo' as const,
        url: m.url,
        category: m.category || undefined,
        caption: m.caption || undefined,
        isCover: m.is_cover || false,
        sortOrder: m.sort_order || 0,
      })) || [];
    
    const videos = media
      ?.filter((m) => m.type === 'video')
      .map((m) => ({
        id: m.id,
        type: 'video' as const,
        url: m.url,
        category: m.category || undefined,
        caption: m.caption || undefined,
        isCover: m.is_cover || false,
        sortOrder: m.sort_order || 0,
      })) || [];
    
    return NextResponse.json({
      photos,
      videos,
      total: media?.length || 0,
    });
  } catch (error) {
    console.error('Error in media API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

