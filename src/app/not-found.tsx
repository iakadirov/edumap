import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container-wrapper py-16">
        <div className="container-content">
          <div className="container-inner">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="mb-2 text-8xl font-bold text-primary">404</h1>
              <h2 className="mb-4 text-2xl font-semibold">Sahifa topilmadi</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
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
    </div>
  );
}
