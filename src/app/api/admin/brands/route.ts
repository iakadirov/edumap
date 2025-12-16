import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Получаем бренды
    const { data: brands, error: brandsError } = await supabase
      .from('school_brands')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (brandsError) {
      console.error('Error fetching brands:', brandsError);
      return NextResponse.json(
        { error: 'Failed to fetch brands' },
        { status: 500 }
      );
    }

    // Получаем общее количество для пагинации
    const { count, error: countError } = await supabase
      .from('school_brands')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting brands:', countError);
    }

    // Получаем количество школ для каждого бренда одним запросом
    const brandIds = brands?.map((b: any) => b.id) || [];
    const { data: schoolsCounts } = await supabase
      .from('organizations')
      .select('brand_id')
      .in('brand_id', brandIds);

    // Группируем по brand_id
    const countMap = new Map<string, number>();
    schoolsCounts?.forEach((school: any) => {
      if (school.brand_id) {
        countMap.set(school.brand_id, (countMap.get(school.brand_id) || 0) + 1);
      }
    });

    // Преобразуем данные для удобства
    const brandsWithCount = brands?.map((brand: any) => ({
      ...brand,
      schools_count: countMap.get(brand.id) || 0,
    })) || [];

    return NextResponse.json({
      brands: brandsWithCount,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/brands:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, slug, logo_url, website, founder, description, founded_year, phone, email, instagram, facebook, youtube } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Проверяем уникальность slug
    const { data: existing } = await supabase
      .from('school_brands')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Brand with this slug already exists' },
        { status: 400 }
      );
    }

    // Создаем бренд
    const { data: newBrand, error: brandError } = await supabase
      .from('school_brands')
      .insert({
        name,
        slug,
        logo_url: logo_url || null,
        website: website || null,
        founder: founder || null,
        description: description || null,
        founded_year: founded_year || null,
        phone: phone || null,
        email: email || null,
        instagram: instagram || null,
        facebook: facebook || null,
        youtube: youtube || null,
      })
      .select()
      .single();

    if (brandError) {
      console.error('Error creating brand:', brandError);
      return NextResponse.json(
        { error: 'Failed to create brand: ' + brandError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: newBrand,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/brands:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

