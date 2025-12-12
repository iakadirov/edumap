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
                Farzandingiz uchun
                <span className="text-primary"> eng yaxshi maktabni toping</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                Oʻzbekistonning yagona taʼlim platformasi. Ota-onalarga shaffof maʼlumotlar,
                halol sharhlar va AI tavsiyalari orqali eng yaxshi taʼlimni tanlashda yordam beramiz.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/schools">Maktab topish</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/schools">Maktablar katalogi</Link>
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
              Nima uchun EduMap.uz?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Maktabni toʻgʻri tanlash uchun barcha kerakli narsalar
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="mb-2 text-xl font-semibold">Shaffof maʼlumotlar</h3>
              <p className="text-muted-foreground">
                Obʼektiv reytinglar, statistika va maktablar natijalari
                haqiqiy metrikalar asosida
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="mb-2 text-xl font-semibold">Halol sharhlar</h3>
              <p className="text-muted-foreground">
                Tasdiqlangan haqiqiy ota-onalar sharhlari. Xulosa chiqarishga
                yordam beramiz
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="mb-2 text-xl font-semibold">AI tavsiyalar</h3>
              <p className="text-muted-foreground">
                Talab va afzalliklaringizga asoslangan aqlli tavsiyalar.
                Ideal maktabni topamiz
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
