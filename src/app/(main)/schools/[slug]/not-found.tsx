import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-wrapper py-16">
      <div className="container-content">
        <div className="container-inner">
          <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Maktab topilmadi</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Bunday nomdagi maktab mavjud emas yoki oʻchirilgan.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/schools">Katalogga qaytish</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Bosh sahifaga</Link>
          </Button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

