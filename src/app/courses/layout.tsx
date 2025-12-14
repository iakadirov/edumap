import { Metadata } from 'next';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: 'Kurslar — EduMap.uz',
  description: 'TODO: Kurslar katalogi (Hozircha ishlamaydi)',
};

/**
 * Layout для раздела курсов (courses)
 * 
 * TODO: Bu bo'lim keyingi bosqichda ishlab chiqiladi
 * Hozircha umumiy Header va Footer ishlatiladi
 * 
 * @see docs/FUTURE_MODULES.md
 */
export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegionProvider>
      <div className="flex min-h-screen flex-col">
        {/* TODO: CoursesHeader ni qo'shing */}
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </RegionProvider>
  );
}

