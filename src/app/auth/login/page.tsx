'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

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
          .select('role, is_active')
          .eq('auth_user_id', data.user.id)
          .single();

        if (userError || !userData || !userData.is_active) {
          setError('Foydalanuvchi topilmadi yoki faol emas');
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
        if (['super_admin', 'admin', 'moderator'].includes(userData.role)) {
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

