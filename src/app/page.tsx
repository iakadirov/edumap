import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Найдите лучшую школу
                <span className="text-primary"> для вашего ребёнка</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                Единая образовательная платформа Узбекистана. Помогаем родителям
                выбрать лучшее образование через прозрачные данные, честные отзывы и
                AI-рекомендации.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/schools">Найти школу</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/schools">Каталог школ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Почему EduMap.uz?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Всё, что нужно для правильного выбора школы
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="mb-2 text-xl font-semibold">Прозрачные данные</h3>
              <p className="text-muted-foreground">
                Объективные рейтинги, статистика и результаты школ на основе
                реальных метрик
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="mb-2 text-xl font-semibold">Честные отзывы</h3>
              <p className="text-muted-foreground">
                Отзывы реальных родителей с верификацией. Помогаем принять
                взвешенное решение
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="mb-2 text-xl font-semibold">AI-подбор</h3>
              <p className="text-muted-foreground">
                Умные рекомендации на основе ваших требований и предпочтений.
                Найдём идеальную школу
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
