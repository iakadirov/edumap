import { Layout } from '@/components/shared/Layout';
import { RegionProvider } from '@/contexts/RegionContext';

export default function MainLayout({
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

