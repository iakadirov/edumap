import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CoursesNotFound() {
  return (
    <div className="container-wrapper py-16">
      <div className="container-content">
        <div className="container-inner">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
            <h2 className="mb-4 text-2xl font-semibold">Kurslar bo'limi</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Bu bo'lim hozircha ishlab chiqilmoqda. Tez orada mavjud bo'ladi!
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild>
                <Link href="/">Bosh sahifaga</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/schools/list">Maktablar katalogi</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
