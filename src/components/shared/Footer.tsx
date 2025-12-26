'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  GlobusBold,
  MapPointBold,
  LetterBold,
  PhoneCallingBold,
} from '@solar-icons/react-perf';

/**
 * Footer компонент с современным дизайном
 * 
 * Features:
 * - CTA секция сверху с призывом к действию
 * - Логотип и слоган
 * - Навигационные ссылки
 * - Контакты
 * - Социальные сети
 * - Языковой селектор
 * - Copyright и юридические ссылки
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/edumap-uz',
      icon: 'linkedin',
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/edumap.uz',
      icon: 'instagram',
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/edumap.uz',
      icon: 'facebook',
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@edumapuz',
      icon: 'youtube',
    },
  ];

  return (
    <footer className="relative">
      {/* CTA Section */}
      <section className="container-wrapper py-6">
        <div className="container-content bg-gradient-to-br from-primary to-blue-700 text-white rounded-t-3xl">
          <div className="container-inner py-12 md:py-16">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ta'lim muassasasini topishga tayyormisiz?
              </h2>
              <p className="text-lg text-white/90 mt-6">
                Bepul baholash va EduMap.uz kompaniyasi sizga qanday yordam bera olishini bilib oling.
              </p>
              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold"
                >
                  <Link href="/schools">
                    Hozir bepul baholashni boshlash
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <section className="container-wrapper">
        <div className="container-content bg-white rounded-b-3xl">
          <div className="container-inner py-12 md:py-16">
              {/* Top Row: Logo and Tagline */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/logo/logo.svg"
                    alt="EduMap.uz"
                    width={128}
                    height={32}
                    className="h-8 w-auto"
                  />
                </Link>
                <p className="text-muted-foreground text-sm md:text-base">
                  Haqiqiy ishlaydigan ta'lim platformasi.
                </p>
              </div>

              {/* Middle Section: Links and Contact */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                {/* Loyiha */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Loyiha</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link
                        href="/about"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Loyiha haqida
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Xizmatlar
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/testimonials"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Sharhlar
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Aloqa
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Navigatsiya */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Navigatsiya</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link
                        href="/"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Asosiy afzalliklar
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/schools"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Bizning xizmatlarimiz
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/why-choose"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Nima uchun EduMap
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/testimonials"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Sharhlar
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Aloqa */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Aloqa</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <LetterBold className="w-4 h-4" />
                      <a
                        href="mailto:info@edumap.uz"
                        className="hover:text-primary transition-colors"
                      >
                        info@edumap.uz
                      </a>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <PhoneCallingBold className="w-4 h-4" />
                      <a
                        href="tel:+998901234567"
                        className="hover:text-primary transition-colors"
                      >
                        +998 90 123 45 67
                      </a>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <MapPointBold className="w-4 h-4" />
                      <span>Toshkent, O'zbekiston</span>
                    </li>
                  </ul>
                </div>

                {/* Language and Social */}
                <div className="space-y-4">
                  {/* Language Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
                      <GlobusBold className="w-4 h-4" />
                      <span>O'zbek</span>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="flex items-center gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-muted/50 transition-all"
                        aria-label={social.name}
                        title={social.name}
                      >
                        <span className="text-xs font-semibold">
                          {social.icon === 'linkedin' && 'in'}
                          {social.icon === 'instagram' && 'ig'}
                          {social.icon === 'facebook' && 'fb'}
                          {social.icon === 'youtube' && 'yt'}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Copyright and Legal Links */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                  © {currentYear} EduMap.uz. Barcha huquqlar himoyalangan.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Shartlar va sharoitlar
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Maxfiylik siyosati
                  </Link>
                  <Link
                    href="/cookies"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Cookie'lar
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
