import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    // Разрешаем поиск для всех авторизованных пользователей (включая school_admin)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ brands: [] });
    }

    const supabase = await createClient();

    // Поиск брендов по названию (ILIKE для регистронезависимого поиска)
    const { data: brands, error: searchError } = await supabase
      .from('school_brands')
      .select('id, name, slug, logo_url')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(limit);

    if (searchError) {
      console.error('Error searching brands:', searchError);
      return NextResponse.json(
        { error: 'Failed to search brands' },
        { status: 500 }
      );
    }

    return NextResponse.json({ brands: brands || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/brands/search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

