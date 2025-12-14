import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canEditSchool } from '@/lib/auth/permissions';

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
 * POST /api/admin/schools/[id]/status/publish
 * Опубликовать школу (admin/super_admin)
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

