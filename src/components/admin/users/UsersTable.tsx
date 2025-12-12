'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  search: string;
  role: string;
}

export function UsersTable({
  users,
  currentPage,
  totalPages,
  search: initialSearch,
  role: initialRole,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== 'all') {
      params.set('role', value);
    } else {
      params.delete('role');
    }
    params.set('page', '1');
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleDelete = async (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        // Полная перезагрузка страницы для обновления данных
        window.location.reload();
      } else {
        alert('Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      moderator: 'Moderator',
      school_admin: 'Maktab Admin',
      user: 'Foydalanuvchi',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="school_admin">Maktab Admin</SelectItem>
            <SelectItem value="user">Foydalanuvchi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tarif</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Foydalanuvchilar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.full_name || 'Nomsiz'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.subscription_tier === 'premium' ? 'default' : 'outline'}>
                      {user.subscription_tier === 'premium' ? 'Premium' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`} prefetch={false}>Tahrirlash</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        className="text-destructive hover:text-destructive"
                      >
                        O'chirish
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sahifa {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Oldingi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Foydalanuvchini o'chirish</DialogTitle>
            <DialogDescription>
              {userToDelete?.full_name || userToDelete?.email || 'Bu foydalanuvchi'}ni o'chirishni
              tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

