import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-xl font-semibold">Sahifa topilmadi</h2>
        <p className="mb-8 text-muted-foreground">
          Admin panelda bunday sahifa mavjud emas.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/admin/dashboard">Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/schools">Maktablar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
