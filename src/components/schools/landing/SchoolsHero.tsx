'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  HeroSection,
  HeroTitle,
  HeroSubtitle,
} from '@/components/ui/section';
import {
  BookBold,
  BuildingsBold,
  MapPointBold,
  StarBold,
  AltArrowDownLinear,
} from '@solar-icons/react-perf';

const stats = [
  {
    id: 'schools',
    value: '500+',
    label: 'Maktablar',
    icon: BookBold,
    color: '#0d8bf2',
  },
  {
    id: 'regions',
    value: '14',
    label: 'Viloyatlar',
    icon: MapPointBold,
    color: '#31ab08',
  },
  {
    id: 'reviews',
    value: '50K+',
    label: 'Sharhlar',
    icon: StarBold,
    color: '#ef6e2e',
  },
];

export function SchoolsHero() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <HeroSection>
      <div className="space-y-6 sm:space-y-8 md:space-y-10 w-full max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d8bf2]/10 text-[#0d8bf2]">
            <BuildingsBold className="w-4 h-4" />
            <span className="text-sm font-medium">Maktablar katalogi</span>
          </div>
        </div>

        {/* Main heading */}
        <div className="space-y-4 sm:space-y-6">
          <HeroTitle>
            Farzandingiz uchun{' '}
            <span className="text-[#0d8bf2] relative inline-block">
              eng yaxshi maktabni
              {/* Underline decoration */}
              <svg
                className="hidden sm:block absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 text-[#0d8bf2]/20"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,8 Q50,0 100,8 T200,8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            toping
          </HeroTitle>
          <HeroSubtitle>
            O'zbekistondagi barcha maktablar bitta platformada. Shaffof ma'lumotlar,
            haqiqiy sharhlar va oson qidiruv.
          </HeroSubtitle>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-[#0d8bf2] hover:bg-[#0b7dd9] text-white text-base sm:text-lg font-semibold shadow-lg shadow-[#0d8bf2]/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Link href="/schools/list">
              <BookBold className="w-5 h-5 mr-2" />
              Maktablar katalogi
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToHowItWorks}
            className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-[#0d8bf2] hover:bg-[#0d8bf2]/5 text-[#0c1319] text-base sm:text-lg font-semibold transition-all"
          >
            Qanday ishlaydi?
            <AltArrowDownLinear className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12 pt-4 sm:pt-6 md:pt-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="flex flex-col items-center gap-1 sm:gap-2">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1 sm:mb-2"
                  style={{ backgroundColor: `${stat.color}12` }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: stat.color }} />
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#0c1319]">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm md:text-base text-[#5a6c7d]">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </HeroSection>
  );
}
