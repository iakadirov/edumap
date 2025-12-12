import Link from 'next/link';

/**
 * Footer компонент с информацией о проекте
 * 
 * Features:
 * - Информация о проекте EduMap.uz
 * - Ссылки: О проекте, Контакты
 * - Copyright
 * - Responsive дизайн
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container-wrapper">
        <div className="container-content">
          <div className="container-inner py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* О проекте */}
          <div className="space-y-4">
            <h3 className="font-semibold">EduMap.uz</h3>
            <p className="text-sm text-muted-foreground">
              Oʻzbekistonning yagona taʼlim platformasi. Ota-onalarga bolalari uchun
              eng yaxshi taʼlimni tanlashda yordam beramiz.
            </p>
          </div>

          {/* Навигация */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navigatsiya</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link
                  href="/schools"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Maktablar katalogi
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Loyiha haqida
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div className="space-y-4">
            <h3 className="font-semibold">Maʼlumot</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contacts"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Aloqa
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Maxfiylik siyosati
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h3 className="font-semibold">Aloqa</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: info@edumap.uz</li>
              <li>Oʻzbekiston, Toshkent</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} EduMap.uz. Barcha huquqlar himoyalangan.
          </p>
        </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

