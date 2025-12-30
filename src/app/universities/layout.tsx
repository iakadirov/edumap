import { Metadata } from 'next';
import { Layout } from '@/components/shared/Layout';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: 'Oliygohlar — EduMap.uz',
  description: 'TODO: Oliygohlar katalogi (Hozircha ishlamaydi)',
};

/**
 * Layout для раздела университетов (universities)
 *
 * TODO: Bu bo'lim keyingi bosqichda ishlab chiqiladi
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
      <Layout>{children}</Layout>
    </RegionProvider>
  );
}

