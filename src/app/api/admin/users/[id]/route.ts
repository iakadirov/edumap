import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { email, full_name, password, role, subscription_tier, is_active, email_verified } = body;

    const supabase = await createClient();

    // Проверяем существование пользователя
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверяем права на изменение роли
    if (existing.role === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot modify super admin' },
        { status: 403 }
      );
    }

    if (role === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admin can assign super_admin role' },
        { status: 403 }
      );
    }

    // Обновляем пароль через Admin API, если указан
    if (password && existing.auth_user_id) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        try {
          const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            }
          );

          await adminClient.auth.admin.updateUserById(existing.auth_user_id, {
            password,
          });
        } catch (adminError) {
          console.error('Error updating password:', adminError);
          // Продолжаем обновление других полей
        }
      }
    }

    // Обновляем запись в users
    const updateData: any = {
      full_name: full_name || null,
      role: role || existing.role,
      subscription_tier: subscription_tier || existing.subscription_tier,
      is_active: is_active ?? existing.is_active,
      email_verified: email_verified ?? existing.email_verified,
    };

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user: ' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    // Проверяем, что не удаляем себя
    if (user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    // Получаем пользователя для проверки роли
    const { data: userToDelete } = await supabase
      .from('users')
      .select('role, auth_user_id')
      .eq('id', id)
      .single();

    // Super admin не может удалять других super admin
    if (userToDelete?.role === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin' },
        { status: 403 }
      );
    }

    // Удаляем пользователя из auth.users через Admin API, если есть auth_user_id
    if (userToDelete?.auth_user_id) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        try {
          const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false,
              },
            }
          );

          await adminClient.auth.admin.deleteUser(userToDelete.auth_user_id);
        } catch (adminError) {
          console.error('Error deleting auth user:', adminError);
          // Продолжаем удаление из users
        }
      }
    }

    // Удаляем пользователя из users (cascade удалит связанные записи)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
