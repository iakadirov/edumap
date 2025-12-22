import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { validateCreateSchool } from '@/lib/validation/schemas/school-details';
import type { OrganizationRow } from '@/types/organization';

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

    // Валидация входных данных
    const validation = validateCreateSchool(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { organization, school_details } = validation.data;

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

    // Явно указываем тип для результата запроса
    const typedNewOrganization = newOrganization as OrganizationRow;

    // Создаем school_details с обязательными полями
    const { error: detailsError } = await supabase
      .from('school_details')
      .insert({
        organization_id: typedNewOrganization.id,
        school_type: school_details.school_type,
        grade_from: school_details.grade_from ?? 1,
        grade_to: school_details.grade_to ?? 11,
        primary_language: school_details.primary_language || 'uzbek',
        accepts_preparatory: school_details.accepts_preparatory ?? false,
        accepted_grades: school_details.accepted_grades,
        additional_languages: school_details.additional_languages,
        curriculum: school_details.curriculum,
        fee_monthly_min: school_details.fee_monthly_min,
        fee_monthly_max: school_details.fee_monthly_max,
        pricing_tiers: school_details.pricing_tiers,
      });

    if (detailsError) {
      console.error('Error creating school details:', detailsError);
      // Откатываем создание организации
      await supabase
        .from('organizations')
        .delete()
        .eq('id', typedNewOrganization.id);
      
      return NextResponse.json(
        { error: 'Failed to create school details: ' + detailsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: typedNewOrganization.id,
      slug: typedNewOrganization.slug,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/schools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

