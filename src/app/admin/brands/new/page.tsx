import { BrandForm } from '@/components/admin/brands/BrandForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewBrandPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Yangi brend qo'shish</h1>
            <p className="text-muted-foreground mt-1">
              Yangi brend ma'lumotlarini kiriting
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/brands">Orqaga</Link>
          </Button>
        </div>
        <BrandForm />
      </div>
    </div>
  );
}

