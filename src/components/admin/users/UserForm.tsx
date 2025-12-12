'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface UserFormProps {
  user?: any;
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Основная информация
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Роль и тариф
  const [role, setRole] = useState(user?.role || 'user');
  const [subscriptionTier, setSubscriptionTier] = useState(user?.subscription_tier || 'free');
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [emailVerified, setEmailVerified] = useState(user?.email_verified ?? false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Валидация
      if (!email) {
        setError('Email kiritilishi kerak');
        setLoading(false);
        return;
      }

      if (!isEdit && !password) {
        setError('Parol kiritilishi kerak');
        setLoading(false);
        return;
      }

      if (password && password !== confirmPassword) {
        setError('Parollar mos kelmaydi');
        setLoading(false);
        return;
      }

      if (password && password.length < 6) {
        setError('Parol kamida 6 belgidan iborat bo\'lishi kerak');
        setLoading(false);
        return;
      }

      const url = isEdit ? `/api/admin/users/${user.id}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          full_name: fullName || null,
          password: password || undefined,
          role,
          subscription_tier: subscriptionTier,
          is_active: isActive,
          email_verified: emailVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        setError(data.error || 'Xatolik yuz berdi. Konsolni tekshiring.');
        setLoading(false);
        return;
      }

      // Успешно сохранено
      if (isEdit) {
        window.location.href = `/admin/users/${user.id}`;
      } else {
        window.location.href = `/admin/users`;
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Основная информация */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Asosiy ma'lumotlar</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              disabled={isEdit} // Email нельзя менять после создания
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Email o'zgartirib bo'lmaydi
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">To'liq ism</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ism Familiya"
            />
          </div>
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Parol *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kamida 6 belgi"
                  required={!isEdit}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Parolni tasdiqlash *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta kiriting"
                  required={!isEdit}
                  minLength={6}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Роль и тариф */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Rol va tarif</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Foydalanuvchi</SelectItem>
                <SelectItem value="school_admin">Maktab Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subscriptionTier">Tarif</Label>
            <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Faol
            </Label>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="emailVerified"
              checked={emailVerified}
              onCheckedChange={(checked) => setEmailVerified(checked === true)}
            />
            <Label htmlFor="emailVerified" className="cursor-pointer">
              Email tasdiqlangan
            </Label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>
    </form>
  );
}

