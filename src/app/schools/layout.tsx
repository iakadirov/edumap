import { Metadata } from 'next';
import { Layout } from '@/components/shared/Layout';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: 'Maktablar katalogi — EduMap.uz',
  description: 'Oʻzbekistondagi barcha maktablar bir joyda. Shaffof maʼlumotlar, halol sharhlar va AI tavsiyalari orqali eng yaxshi maktabni tanlang.',
};

/**
 * Layout для раздела школ
 *
 * Features:
 * - Использует общий Layout с единым Header
 * - Подключает RegionProvider для работы с регионами
 */
export default function SchoolsLayout({
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

