'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логируем ошибку для отладки
    console.error('Schools page error:', error);
  }, [error]);

  return (
    <div className="container-wrapper py-16">
      <div className="container-content">
        <div className="container-inner">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold">Xatolik yuz berdi</h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Maktablar sahifasini yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded text-left">
                <p className="text-sm font-mono text-red-800">{error.message}</p>
              </div>
            )}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={reset}>Qayta urinish</Button>
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

