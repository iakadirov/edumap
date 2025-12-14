import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Простое кэширование в памяти для проверки пользователя (только для middleware)
// В production лучше использовать Redis или другой кэш
const userCache = new Map<string, { role: string; is_active: boolean; expires: number }>();
const CACHE_TTL = 30 * 1000; // 30 секунд

function getCachedUser(userId: string): { role: string; is_active: boolean } | null {
  const cached = userCache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return { role: cached.role, is_active: cached.is_active };
  }
  if (cached) {
    userCache.delete(userId);
  }
  return null;
}

function setCachedUser(userId: string, role: string, is_active: boolean) {
  userCache.set(userId, {
    role,
    is_active,
    expires: Date.now() + CACHE_TTL,
  });
  // Очистка старых записей (простая реализация)
  if (userCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
      if (value.expires <= now) {
        userCache.delete(key);
      }
    }
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Проверка авторизации для админ маршрутов
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Проверяем кэш перед запросом к БД
    const cached = getCachedUser(user.id);
    if (cached) {
      if (!cached.is_active || !['super_admin', 'admin', 'moderator'].includes(cached.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Пользователь валиден, пропускаем
    } else {
      // Проверка роли пользователя (оптимизировано - только нужные поля)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('auth_user_id', user.id)
        .single();

      if (
        userError ||
        !userData ||
        !userData.is_active ||
        !['super_admin', 'admin', 'moderator'].includes(userData.role)
      ) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Кэшируем результат
      setCachedUser(user.id, userData.role, userData.is_active);
    }
  }

  // Проверка авторизации для маршрутов school_admin
  if (request.nextUrl.pathname.startsWith('/school')) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Проверяем кэш перед запросом к БД
    const cached = getCachedUser(user.id);
    if (cached) {
      if (!cached.is_active || cached.role !== 'school_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Пользователь валиден, пропускаем
    } else {
      // Проверка роли пользователя
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('auth_user_id', user.id)
        .single();

      if (
        userError ||
        !userData ||
        !userData.is_active ||
        userData.role !== 'school_admin'
      ) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Кэшируем результат
      setCachedUser(user.id, userData.role, userData.is_active);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

