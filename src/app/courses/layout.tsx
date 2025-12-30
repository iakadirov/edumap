import { Metadata } from 'next';
import { Layout } from '@/components/shared/Layout';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: 'Kurslar — EduMap.uz',
  description: 'TODO: Kurslar katalogi (Hozircha ishlamaydi)',
};

/**
 * Layout для раздела курсов (courses)
 *
 * TODO: Bu bo'lim keyingi bosqichda ishlab chiqiladi
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
      <Layout>{children}</Layout>
    </RegionProvider>
  );
}

