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
    const { data: currentSchool, error: schoolError } = await supabase
      .from('organizations')
      .select('id, district, school_details(curriculum, school_type, fee_monthly_min)')
      .eq('slug', slug)
      .eq('org_type', 'school')
      .single();
    
    if (schoolError || !currentSchool) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }
    
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '3');
    
    // Получаем похожие школы по району и типу
    const details = Array.isArray(currentSchool.school_details)
      ? currentSchool.school_details[0]
      : currentSchool.school_details;
    
    let query = supabase
      .from('organizations')
      .select(`
        id,
        name,
        slug,
        cover_image_url,
        overall_rating,
        reviews_count,
        district,
        school_details(
          fee_monthly_min,
          school_type,
          curriculum
        )
      `)
      .eq('org_type', 'school')
      .in('status', ['active', 'published'])
      .neq('id', currentSchool.id);
    
    // Фильтруем по району, если есть
    if (currentSchool.district) {
      query = query.eq('district', currentSchool.district);
    }
    
    // Сортируем по рейтингу
    query = query.order('overall_rating', { ascending: false, nullsFirst: false });
    
    // Ограничиваем количество
    query = query.limit(limit);
    
    const { data: schools, error } = await query;
    
    if (error) {
      console.error('Error fetching similar schools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch similar schools' },
        { status: 500 }
      );
    }
    
    // Форматируем данные
    const formattedSchools = schools?.map((school) => {
      const schoolDetails = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      
      return {
        id: school.id,
        slug: school.slug,
        name: school.name,
        coverImage: school.cover_image_url || '',
        rating: {
          score: school.overall_rating ? school.overall_rating / 20 : 0, // Конвертируем из 0-100 в 0-5
          reviewCount: school.reviews_count || 0,
        },
        district: {
          name: school.district || '',
        },
        fee: {
          min: schoolDetails?.fee_monthly_min || 0,
        },
      };
    }) || [];
    
    return NextResponse.json({
      schools: formattedSchools,
    });
  } catch (error) {
    console.error('Error in similar schools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

