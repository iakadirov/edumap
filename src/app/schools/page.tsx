import {
  SchoolsHero,
  SchoolsFeatures,
  SchoolsHowItWorks,
  PopularSchools,
  QuickFilters,
  SchoolsTestimonials,
  SchoolsCTA,
} from '@/components/schools/landing';
import { Section } from '@/components/ui/section';

/**
 * Лендинг страница раздела "Школы"
 *
 * URL: /schools
 *
 * Features:
 * - Hero секция с призывом к действию и статистикой
 * - Преимущества платформы (4 карточки)
 * - Как это работает (3 шага)
 * - Популярные школы (динамически из БД)
 * - Тезкор фильтры (по типу, языку, программе, региону)
 * - Отзывы ота-онали
 * - CTA секция
 */
export default function SchoolsPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <Section padding="hero">
        <SchoolsHero />
      </Section>

      {/* Features Section */}
      <Section variant="muted">
        <SchoolsFeatures />
      </Section>

      {/* How It Works Section */}
      <Section>
        <SchoolsHowItWorks />
      </Section>

      {/* Popular Schools Section */}
      <Section variant="muted">
        <PopularSchools />
      </Section>

      {/* Quick Filters Section */}
      <Section>
        <QuickFilters />
      </Section>

      {/* Testimonials Section */}
      <Section variant="muted">
        <SchoolsTestimonials />
      </Section>

      {/* CTA Section */}
      <Section>
        <SchoolsCTA />
      </Section>
    </div>
  );
}
