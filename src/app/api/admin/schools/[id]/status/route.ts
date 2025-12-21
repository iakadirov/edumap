import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { OrganizationRow } from '@/types/organization';

/**
 * PATCH /api/admin/schools/[id]/status
 * Изменить статус школы
 * 
 * Body: { status: 'draft' | 'pending' | 'published' | 'rejected' | 'suspended' }
 */
export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Только admin и super_admin могут изменять статус
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['draft', 'pending', 'published', 'rejected', 'suspended'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Сначала проверяем существование организации через обычный клиент
    const { data: existing, error: checkError } = await supabase
      .from('organizations')
      .select('id, status')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      console.error('Error checking organization:', checkError);
      return NextResponse.json(
        { error: 'School not found', details: checkError?.message },
        { status: 404 }
      );
    }

    // Явно указываем тип для результата запроса
    const typedExisting = existing as Pick<OrganizationRow, 'id' | 'status'>;

    // Используем service role клиент для обновления статуса (обходит RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Обновляем статус через service role клиент
    const { data: updated, error: updateError } = await adminClient
      .from('organizations')
      // @ts-expect-error - Supabase type inference issue
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      const errorDetails = {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        id,
        status,
        currentStatus: typedExisting.status,
      };
      
      console.error('Error updating status:', errorDetails);
      
      return NextResponse.json(
        { 
          error: 'Failed to update status',
          details: updateError.message,
          code: updateError.code,
          hint: updateError.hint,
          debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Error in PATCH /api/admin/schools/[id]/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/schools/[id]/status/submit
 * Отправить школу на модерацию (school_admin)
 */
export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
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

    // Обновляем статус на pending
    const { error: updateError } = await supabase
      .from('organizations')
      // @ts-expect-error - Supabase type inference issue
      .update({ status: 'pending' })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: 'pending' });
  } catch (error) {
    console.error(
      'Error in POST /api/admin/schools/[id]/status/submit:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/schools/[id]/status
 * Опубликовать школу (admin/super_admin) - устаревший метод, используйте PATCH
 */
export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Только admin и super_admin могут публиковать
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'publish', 'reject', 'suspend'

    const supabase = await createClient();

    let newStatus: string;
    switch (action) {
      case 'publish':
        newStatus = 'published';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'suspend':
        newStatus = 'suspended';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be publish, reject, or suspend' },
          { status: 400 }
        );
    }

    // Обновляем статус
    const { error: updateError } = await supabase
      .from('organizations')
      // @ts-expect-error - Supabase type inference issue
      .update({ status: newStatus })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error(
      'Error in PUT /api/admin/schools/[id]/status:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
