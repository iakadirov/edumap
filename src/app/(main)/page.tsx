import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Главная страница платформы EduMap.uz
 * 
 * URL: /
 * 
 * Features:
 * - Общая информация о платформе
 * - Все типы учебных заведений
 * - Преимущества платформы
 */
export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container-wrapper py-24 md:py-32">
        <div className="container-content">
          <div className="container-inner">
            <div className="mx-auto max-w-4xl text-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                    Oʻzbekistonning yagona
                    <span className="text-primary"> taʼlim platformasi</span>
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Maktablar, oliygohlar, bogʻchalar va kurslar bir joyda. 
                    Shaffof maʼlumotlar, halol sharhlar va AI tavsiyalari orqali 
                    eng yaxshi taʼlimni tanlang.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/schools">Maktablar</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/universities">Oliygohlar</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/kindergartens">Bog'chalar</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/courses">Kurslar</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Organizations */}
      <section className="container-wrapper py-16 md:py-24">
        <div className="container-content">
          <div className="container-inner">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Barcha turdagi taʼlim muassasalari
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Bizning platformada siz barcha turdagi taʼlim muassasalarini topishingiz mumkin
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-4xl">🏫</div>
                  <h3 className="mb-2 text-xl font-semibold">Maktablar</h3>
                  <p className="mb-4 text-muted-foreground">
                    Xususiy, davlat va xalqaro maktablar
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/schools">Ko'rish</Link>
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-4xl">🎓</div>
                  <h3 className="mb-2 text-xl font-semibold">Oliygohlar</h3>
                  <p className="mb-4 text-muted-foreground">
                    Universitetlar va institutlar
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/universities">Ko'rish</Link>
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-4xl">🌳</div>
                  <h3 className="mb-2 text-xl font-semibold">Bog'chalar</h3>
                  <p className="mb-4 text-muted-foreground">
                    Bolalar bog'chalari va tarbiyaviy markazlar
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/kindergartens">Ko'rish</Link>
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-4xl">📚</div>
                  <h3 className="mb-2 text-xl font-semibold">Kurslar</h3>
                  <p className="mb-4 text-muted-foreground">
                    Taʼlim markazlari va kurslar
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/courses">Ko'rish</Link>
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-wrapper py-16 md:py-24 bg-muted/50">
        <div className="container-content">
          <div className="container-inner">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Nima uchun EduMap.uz?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Taʼlim muassasasini toʻgʻri tanlash uchun barcha kerakli narsalar
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6">
                  <div className="mb-4 text-4xl">📊</div>
                  <h3 className="mb-2 text-xl font-semibold">Shaffof maʼlumotlar</h3>
                  <p className="text-muted-foreground">
                    Obʼektiv reytinglar, statistika va natijalar
                    haqiqiy metrikalar asosida
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="mb-4 text-4xl">💬</div>
                  <h3 className="mb-2 text-xl font-semibold">Halol sharhlar</h3>
                  <p className="text-muted-foreground">
                    Tasdiqlangan haqiqiy ota-onalar sharhlari. 
                    Xulosa chiqarishga yordam beramiz
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="mb-4 text-4xl">🤖</div>
                  <h3 className="mb-2 text-xl font-semibold">AI tavsiyalar</h3>
                  <p className="text-muted-foreground">
                    Talab va afzalliklaringizga asoslangan aqlli tavsiyalar.
                    Ideal taʼlim muassasasini topamiz
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
