import { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: 'Bog\'chalar — EduMap.uz',
  description: 'TODO: Bog\'chalar katalogi (Hozircha ishlamaydi)',
};

/**
 * Layout для раздела детских садов (kindergartens)
 * 
 * TODO: Bu bo'lim keyingi bosqichda ishlab chiqiladi
 * Hozircha umumiy Header va Footer ishlatiladi
 * 
 * @see docs/FUTURE_MODULES.md
 */
export default function KindergartensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegionProvider>
      <div className="flex min-h-screen flex-col">
        {/* TODO: KindergartensHeader ni qo'shing */}
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </RegionProvider>
  );
}

