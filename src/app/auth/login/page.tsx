'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import type { UserRow } from '@/types/user';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        // Проверяем, есть ли пользователь в таблице users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, role, is_active, email, auth_user_id')
          .eq('auth_user_id', data.user.id)
          .single();

        // Если пользователь не найден в таблице users, создаем автоматически
        if (userError) {
          // Проверяем код ошибки (PGRST116 = no rows returned)
          if (userError.code === 'PGRST116' || userError.message?.includes('No rows')) {
            // Пользователь не найден - создаем с ролью user по умолчанию
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                auth_user_id: data.user.id,
                email: data.user.email || '',
                role: 'user',
                subscription_tier: 'free',
                is_active: true,
                email_verified: data.user.email_confirmed_at ? true : false,
              });

            if (insertError) {
              setError('Foydalanuvchi yaratishda xatolik: ' + insertError.message);
              await supabase.auth.signOut();
              return;
            }

            // После создания редиректим на главную (обычный пользователь)
            router.push('/');
            router.refresh();
            return;
          } else {
            // Другая ошибка
            setError('Foydalanuvchi topilmadi: ' + (userError.message || 'Nomaʼlum xatolik'));
            await supabase.auth.signOut();
            return;
          }
        }

        if (!userData) {
          setError('Foydalanuvchi topilmadi');
          await supabase.auth.signOut();
          return;
        }

        // Явно указываем тип для результата запроса
        const typedUserData = userData as Pick<UserRow, 'id' | 'role' | 'is_active' | 'email' | 'auth_user_id'>;

        if (!typedUserData.is_active) {
          setError('Foydalanuvchi faol emas. Admin bilan bogʻlaning.');
          await supabase.auth.signOut();
          return;
        }

        // Обновляем last_login_at
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('auth_user_id', data.user.id);

        // Редирект в зависимости от роли
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
        if (['super_admin', 'admin', 'moderator'].includes(typedUserData.role)) {
          router.push(redirectUrl || '/admin/dashboard');
        } else {
          router.push(redirectUrl || '/');
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-wrapper min-h-screen flex items-center justify-center py-12">
      <div className="container-content">
        <div className="container-inner max-w-md w-full">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Kirish</CardTitle>
              <CardDescription className="text-center">
                EduMap.uz hisobingizga kiring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Parol
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Kutilmoqda...' : 'Kirish'}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Hisobingiz yoʻqmi? </span>
                <Link href="/auth/register" className="text-primary hover:underline">
                  Roʻyxatdan oʻtish
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

