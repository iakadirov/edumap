import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Главная страница раздела "Курсы" (учебные центры)
 * 
 * URL: /courses
 */
export default function CoursesPage() {
  return (
    <div className="relative">
      <section className="container-wrapper py-24 md:py-32">
        <div className="container-content">
          <div className="container-inner">
            <div className="mx-auto max-w-4xl text-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                    Taʼlim markazi
                    <span className="text-primary"> tanlash</span>
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Oʻzbekistondagi barcha taʼlim markazlari va kurslar bir joyda. 
                    Shaffof maʼlumotlar va halol sharhlar orqali eng yaxshi kursni tanlang.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/courses/list">Kurslar katalogi</Link>
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

