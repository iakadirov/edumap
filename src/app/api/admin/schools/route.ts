import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    // Разрешаем создание школы для admin, super_admin и school_admin
    if (!user || !['super_admin', 'admin', 'school_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organization, school_details } = body;

    if (!organization || !school_details) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Для school_admin устанавливаем статус и связываем с пользователем
    // По умолчанию школы сразу активируются (published)
    if (user.role === 'school_admin') {
      // Проверяем, что статус валидный для текущей БД
      const validStatuses = ['draft', 'pending', 'published', 'rejected', 'suspended'];
      if (organization.status && !validStatuses.includes(organization.status)) {
        organization.status = 'published'; // По умолчанию активируем
      } else {
        organization.status = organization.status || 'published'; // По умолчанию активируем
      }
      organization.admin_user_id = user.id;
    } else {
      // Для admin/super_admin можно указать статус, по умолчанию активируем
      const validStatuses = ['draft', 'pending', 'published', 'rejected', 'suspended'];
      if (organization.status && !validStatuses.includes(organization.status)) {
        organization.status = 'published'; // По умолчанию активируем
      } else {
        organization.status = organization.status || 'published'; // По умолчанию активируем
      }
    }

    // Проверяем уникальность slug
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', organization.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Создаем организацию
    const { data: newOrganization, error: orgError } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization: ' + orgError.message },
        { status: 500 }
      );
    }

    // Создаем school_details
    const { error: detailsError } = await supabase
      .from('school_details')
      .insert({
        ...school_details,
        organization_id: newOrganization.id,
      });

    if (detailsError) {
      console.error('Error creating school details:', detailsError);
      // Откатываем создание организации
      await supabase
        .from('organizations')
        .delete()
        .eq('id', newOrganization.id);
      
      return NextResponse.json(
        { error: 'Failed to create school details: ' + detailsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: newOrganization.id,
      slug: newOrganization.slug,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/schools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

