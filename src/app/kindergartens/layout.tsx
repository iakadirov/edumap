import { Metadata } from 'next';
import { Layout } from '@/components/shared/Layout';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: "Bog'chalar — EduMap.uz",
  description: "TODO: Bog'chalar katalogi (Hozircha ishlamaydi)",
};

/**
 * Layout для раздела детских садов (kindergartens)
 *
 * TODO: Bu bo'lim keyingi bosqichda ishlab chiqiladi
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
      <Layout>{children}</Layout>
    </RegionProvider>
  );
}

