import type { Metadata } from 'next';
import {
  HomepageHero,
  CategoryCards,
  PlatformStats,
  FeaturesSection,
  PopularInstitutions,
  HowItWorks,
  Testimonials,
  HomeCTA,
} from '@/components/home';

/**
 * SEO Metadata для главной страницы
 */
export const metadata: Metadata = {
  title: "EduMap.uz — O'zbekistondagi barcha ta'lim muassasalari bitta platformada",
  description:
    "Maktab, bog'cha, universitet yoki kurslarni toping, solishtiring va tanlang. Shaffof narxlar, haqiqiy sharhlar va qulay qidiruv.",
  keywords: [
    "ta'lim platformasi",
    'maktablar',
    'oliygohlar',
    "bog'chalar",
    'kurslar',
    "ta'lim muassasalari",
    "O'zbekiston",
    'education',
    'schools',
    'universities',
    'kindergartens',
  ],
  openGraph: {
    title: "EduMap.uz — O'zbekistondagi barcha ta'lim muassasalari",
    description:
      "Maktab, bog'cha, universitet yoki kurslarni toping. Shaffof narxlar va haqiqiy sharhlar.",
    type: 'website',
    locale: 'uz_UZ',
  },
  alternates: {
    canonical: '/',
  },
};

/**
 * Главная страница платформы EduMap.uz
 *
 * URL: /
 *
 * Секции:
 * 1. Hero (занимает почти весь viewport)
 * 2. Категории (модульная сетка карточек)
 * 3. Статистика платформы
 * 4. Преимущества
 * 5. Популярные учреждения
 * 6. Как это работает
 * 7. Отзывы
 * 8. CTA
 */
export default function HomePage() {
  return (
    <div className="relative bg-[#f2f9ff]">
      {/* 1. Hero секция - фиксированная высота 560px */}
      <section className="container-wrapper pt-6 pb-0">
        <div className="container-content">
          <div className="container-inner py-0">
            <HomepageHero />
          </div>
        </div>
      </section>

      {/* 2. Категории */}
      <section className="container-wrapper py-6">
        <div className="container-content">
          <div className="container-inner">
            <CategoryCards />
          </div>
        </div>
      </section>

      {/* 3. Статистика */}
      <section className="container-wrapper py-6">
        <div className="container-content">
          <div className="container-inner">
            <PlatformStats />
          </div>
        </div>
      </section>

      {/* 4. Преимущества */}
      <section className="container-wrapper py-6">
        <div className="container-content">
          <div className="container-inner">
            <FeaturesSection />
          </div>
        </div>
      </section>

      {/* 5. Популярные учреждения */}
      <section className="container-wrapper py-6">
        <div className="container-content">
          <div className="container-inner">
            <PopularInstitutions />
          </div>
        </div>
      </section>

      {/* 6. Как это работает */}
      <section className="container-wrapper py-6">
        <div className="container-content">
          <div className="container-inner">
            <HowItWorks />
          </div>
        </div>
      </section>

      {/* 7. Отзывы */}
      <section className="container-wrapper py-6">
        <div className="container-content">
          <div className="container-inner">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="container-wrapper py-6">
        <div className="container-content">
          <div className="container-inner">
            <HomeCTA />
          </div>
        </div>
      </section>
    </div>
  );
}
