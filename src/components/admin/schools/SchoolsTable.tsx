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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface School {
  id: string;
  name_uz: string | null;
  name_ru: string | null;
  status: string | null;
  created_at: string;
  city: string | null;
  district: string | null;
}

interface SchoolsTableProps {
  schools: School[];
  currentPage: number;
  totalPages: number;
  search: string;
  status: string;
}

export function SchoolsTable({
  schools,
  currentPage,
  totalPages,
  search: initialSearch,
  status: initialStatus,
}: SchoolsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/schools?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/admin/schools?${params.toString()}`);
  };

  const handleDelete = async (school: School) => {
    setSchoolToDelete(school);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!schoolToDelete) return;

    try {
      const response = await fetch(`/api/admin/schools/${schoolToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setDeleteDialogOpen(false);
        setSchoolToDelete(null);
      } else {
        alert('Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/schools?${params.toString()}`);
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
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="active">Faol</SelectItem>
            <SelectItem value="pending">Kutilmoqda</SelectItem>
            <SelectItem value="inactive">Nofaol</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead>Shahar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Maktablar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">
                    {school.name_uz || school.name_ru || 'Nomsiz'}
                  </TableCell>
                  <TableCell>
                    {school.city || '-'} {school.district ? `, ${school.district}` : ''}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        school.status === 'active'
                          ? 'default'
                          : school.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {school.status === 'active'
                        ? 'Faol'
                        : school.status === 'pending'
                          ? 'Kutilmoqda'
                          : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(school.created_at).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/schools/${school.id}`}>Tahrirlash</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(school)}
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
            <DialogTitle>Maktabni o'chirish</DialogTitle>
            <DialogDescription>
              {schoolToDelete?.name_uz || schoolToDelete?.name_ru || 'Bu maktab'}ni o'chirishni
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

