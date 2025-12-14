import { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: 'Oliygohlar — EduMap.uz',
  description: 'TODO: Oliygohlar katalogi (Hozircha ishlamaydi)',
};

/**
 * Layout для раздела университетов (universities)
 * 
 * TODO: Bu bo'lim keyingi bosqichda ishlab chiqiladi
 * Hozircha umumiy Header va Footer ishlatiladi
 * 
 * @see docs/FUTURE_MODULES.md
 */
export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegionProvider>
      <div className="flex min-h-screen flex-col">
        {/* TODO: UniversitiesHeader ni qo'shing */}
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </RegionProvider>
  );
}

