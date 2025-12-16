'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, MoreVertical, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
  schools_count?: number;
  created_at: string;
}

interface BrandListProps {
  brands: Brand[];
  currentPage: number;
  totalPages: number;
  search: string;
}

export function BrandList({ brands, currentPage, totalPages, search: initialSearch }: BrandListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', '1');
    router.push(`/admin/brands?${params.toString()}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" brendini o'chirishni xohlaysizmi?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Xatolik yuz berdi');
      }

      showToast({
        type: 'success',
        title: 'Brend o\'chirildi',
        description: `"${name}" brendi muvaffaqiyatli o'chirildi`,
        duration: 3000,
      });

      router.refresh();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Xatolik',
        description: error.message || 'Brendni o\'chirishda xatolik yuz berdi',
        duration: 5000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Brend nomi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Qidirish
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brend</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Veb-sayt</TableHead>
              <TableHead>Maktablar</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead className="text-right">Harakatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Brendlar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {brand.logo_url ? (
                        <Image
                          src={brand.logo_url}
                          alt={brand.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{brand.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {brand.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {brand.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{brand.schools_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(brand.created_at).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/brands/${brand.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Tahrirlash
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(brand.id, brand.name)}
                          disabled={deletingId === brand.id}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
          <div className="text-sm text-muted-foreground">
            Sahifa {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                const params = new URLSearchParams();
                if (search) params.set('search', search);
                params.set('page', (currentPage - 1).toString());
                router.push(`/admin/brands?${params.toString()}`);
              }}
            >
              Oldingi
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => {
                const params = new URLSearchParams();
                if (search) params.set('search', search);
                params.set('page', (currentPage + 1).toString());
                router.push(`/admin/brands?${params.toString()}`);
              }}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

