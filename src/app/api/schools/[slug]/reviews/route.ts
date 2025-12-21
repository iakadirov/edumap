import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { OrganizationRow } from '@/types/organization';

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

    // Явно указываем тип для результата запроса
    const typedSchool = school as Pick<OrganizationRow, 'id'>;
    
    // Параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // 'all' | '5' | '4' | '3' | '2' | '1'
    const sort = searchParams.get('sort') || 'newest'; // 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Базовый запрос
    let query = supabase
      .from('school_reviews')
      .select('*')
      .eq('organization_id', typedSchool.id);
    
    // Фильтр по рейтингу
    if (filter && filter !== 'all') {
      const rating = parseInt(filter);
      if (rating >= 1 && rating <= 5) {
        query = query.eq('rating', rating);
      }
    }
    
    // Сортировка
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'highest':
        query = query.order('rating', { ascending: false });
        break;
      case 'lowest':
        query = query.order('rating', { ascending: true });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }
    
    // Пагинация
    query = query.range(offset, offset + limit - 1);
    
    const { data: reviews, error } = await query;
    
    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Тип для school_reviews
    type SchoolReviewRow = {
      id: string;
      organization_id: string;
      author_name: string;
      author_role: string;
      author_avatar_url: string | null;
      is_verified_parent: boolean;
      rating: number;
      ratings: unknown;
      content: string;
      pros: string[] | null;
      cons: string[] | null;
      helpful_count: number;
      school_response: string | null;
      school_response_date: string | null;
      created_at: string;
    };

    // Явно указываем тип для результата запроса
    const typedReviews = (reviews || []) as SchoolReviewRow[];
    
    // Получаем общее количество для пагинации
    let countQuery = supabase
      .from('school_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', typedSchool.id);
    
    if (filter && filter !== 'all') {
      const rating = parseInt(filter);
      if (rating >= 1 && rating <= 5) {
        countQuery = countQuery.eq('rating', rating);
      }
    }
    
    const { count } = await countQuery;
    
    // Форматируем данные
    const formattedReviews = typedReviews.map((review) => ({
      id: review.id,
      author: {
        name: review.author_name,
        avatar: review.author_avatar_url || undefined,
        role: review.author_role,
        isVerified: review.is_verified_parent || false,
      },
      rating: review.rating,
      ratings: review.ratings || undefined,
      date: new Date(review.created_at).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      content: review.content,
      pros: review.pros || [],
      cons: review.cons || [],
      helpfulCount: review.helpful_count || 0,
      schoolResponse: review.school_response
        ? {
            content: review.school_response,
            date: review.school_response_date
              ? new Date(review.school_response_date).toLocaleDateString('uz-UZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '',
          }
        : undefined,
    })) || [];
    
    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

