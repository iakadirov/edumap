import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Главная страница раздела "Вузы"
 * 
 * URL: /universities
 */
export default function UniversitiesPage() {
  return (
    <div className="relative">
      <section className="container-wrapper py-24 md:py-32">
        <div className="container-content">
          <div className="container-inner">
            <div className="mx-auto max-w-4xl text-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                    Oliygoh
                    <span className="text-primary"> tanlash</span>
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Oʻzbekistondagi barcha oliygohlar bir joyda. 
                    Shaffof maʼlumotlar va halol sharhlar orqali eng yaxshi taʼlimni tanlang.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/universities/list">Oliygohlar katalogi</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

