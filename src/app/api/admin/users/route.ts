import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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
    const { email, full_name, password, role, subscription_tier, is_active, email_verified } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email kiritilishi kerak' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Проверяем уникальность email
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bu email allaqachon ro\'yxatdan o\'tgan' },
        { status: 400 }
      );
    }

    let authUserId: string | null = null;

    // Пытаемся создать пользователя в auth.users через Admin API
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey && password) {
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

        // Создаем пользователя в auth.users
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: email_verified ?? false,
          user_metadata: {
            full_name: full_name || null,
          },
        });

        if (authError) {
          console.error('Error creating auth user:', authError);
          // Продолжаем без auth_user_id - пользователь должен будет зарегистрироваться сам
        } else if (authData?.user) {
          authUserId = authData.user.id;
        }
      } catch (adminError) {
        console.error('Error with admin client:', adminError);
        // Продолжаем без auth_user_id
      }
    }

    // Создаем запись в users
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authUserId,
        email,
        full_name: full_name || null,
        role: role || 'user',
        subscription_tier: subscription_tier || 'free',
        is_active: is_active ?? true,
        email_verified: email_verified ?? false,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user: ' + userError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: newUser.id,
      message: authUserId
        ? 'Foydalanuvchi muvaffaqiyatli yaratildi va email orqali kirishi mumkin.'
        : 'Foydalanuvchi yaratildi. Endi u email orqali ro\'yxatdan o\'tishi kerak.',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

