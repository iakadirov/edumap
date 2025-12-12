import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';

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
      .select('role')
      .eq('id', id)
      .single();

    // Super admin не может удалять других super admin
    if (userToDelete?.role === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin' },
        { status: 403 }
      );
    }

    // Удаляем пользователя
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

