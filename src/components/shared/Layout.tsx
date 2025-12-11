import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Основной Layout компонент для приложения
 * 
 * Обеспечивает структуру: Header + Main + Footer
 * Responsive дизайн (mobile-first)
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

