import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

/**
 * API endpoint для получения данных школы для дублирования
 * GET /api/admin/schools/[id]/duplicate
 * 
 * Возвращает данные школы без системных полей (id, slug, timestamps, ratings)
 * для предзаполнения формы создания новой школы
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin', 'school_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    // Получаем данные организации
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Получаем данные school_details
    const { data: schoolDetails, error: detailsError } = await supabase
      .from('school_details')
      .select('*')
      .eq('organization_id', id)
      .single();

    // Подготавливаем данные организации для дублирования
    // Исключаем системные поля
    const {
      id: _id,
      slug: _slug,
      created_at: _created_at,
      updated_at: _updated_at,
      reviews_count: _reviews_count,
      overall_rating: _overall_rating,
      ...organizationData
    } = organization;

    // Устанавливаем статус по умолчанию для новой школы
    organizationData.status = 'draft';

    // Подготавливаем данные school_details для дублирования
    // Исключаем системные поля
    let schoolDetailsData = null;
    if (schoolDetails) {
      const {
        id: _detailsId,
        organization_id: _orgId,
        created_at: _detailsCreatedAt,
        updated_at: _detailsUpdatedAt,
        ...detailsData
      } = schoolDetails;
      schoolDetailsData = detailsData;
    }

    return NextResponse.json({
      organization: organizationData,
      school_details: schoolDetailsData,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/schools/[id]/duplicate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

