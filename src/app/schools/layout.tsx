import { Metadata } from 'next';
import { SchoolsHeader } from '@/components/schools/Header/SchoolsHeader';
import { Footer } from '@/components/shared/Footer';
import { RegionProvider } from '@/contexts/RegionContext';

export const metadata: Metadata = {
  title: 'Maktablar katalogi — EduMap.uz',
  description: 'Oʻzbekistondagi barcha maktablar bir joyda. Shaffof maʼlumotlar, halol sharhlar va AI tavsiyalari orqali eng yaxshi maktabni tanlang.',
};

/**
 * Layout для раздела школ
 * 
 * Features:
 * - Использует SchoolsHeader с раздел-специфичной навигацией
 * - Подключает RegionProvider для работы с регионами
 * - Общий Footer
 */
export default function SchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegionProvider>
      <div className="flex min-h-screen flex-col">
        <SchoolsHeader />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </RegionProvider>
  );
}

