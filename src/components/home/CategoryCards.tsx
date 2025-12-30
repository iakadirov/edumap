import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  BookBold,
  SmileCircleBold,
  SquareAcademicCapBold,
  NotebookBold,
  AltArrowRightBold,
} from '@solar-icons/react-perf';
import { cn } from '@/lib/utils';

const categories = [
  {
    id: 'schools',
    title: 'Maktablar',
    description: "500+ maktablar barcha hududlarda",
    subtext: 'Davlat, xususiy va xalqaro',
    icon: BookBold,
    href: '/schools',
    color: '#0d8bf2',
    bgGradient: 'from-blue-50 to-blue-100/30',
  },
  {
    id: 'kindergartens',
    title: "Bog'chalar",
    description: "300+ bog'chalar barcha hududlarda",
    subtext: "Bolalar bog'chalari va markazlar",
    icon: SmileCircleBold,
    href: '/kindergartens',
    color: '#31ab08',
    bgGradient: 'from-green-50 to-green-100/30',
  },
  {
    id: 'universities',
    title: 'Universitetlar',
    description: "80+ OTM O'zbekiston bo'ylab",
    subtext: 'Davlat va xususiy OTMlar',
    icon: SquareAcademicCapBold,
    href: '/universities',
    color: '#0284c7',
    bgGradient: 'from-sky-50 to-sky-100/30',
  },
  {
    id: 'courses',
    title: 'Kurslar',
    description: "1000+ kurslar va o'quv markazlari",
    subtext: "IT, tillar, kasb-hunar",
    icon: NotebookBold,
    href: '/courses',
    color: '#ef6e2e',
    bgGradient: 'from-orange-50 to-orange-100/30',
  },
];

export function CategoryCards() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Section header */}
      <div className="text-center space-y-3 sm:space-y-4 px-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.03em] sm:tracking-[-0.04em] text-[#0c1319]">
          Ta'lim muassasalarini tanlang
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-[#5a6c7d] max-w-2xl mx-auto">
          Barcha turdagi ta'lim muassasalari bitta platformada
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.id} href={category.href}>
              <Card className="group relative overflow-hidden p-5 sm:p-6 md:p-8 h-full bg-[#fafdff] border border-[#d1d9e3] rounded-[20px] sm:rounded-[24px] md:rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent">
                {/* Hover gradient background */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    category.bgGradient
                  )}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[10px] sm:rounded-[12px] flex items-center justify-center mb-4 sm:mb-5 md:mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: category.color }} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-[-0.02em] sm:tracking-[-0.03em] mb-2 sm:mb-3 text-[#0c1319]">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#5a6c7d] mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">
                    {category.description}
                  </p>
                  <p className="text-xs sm:text-sm text-[#5a6c7d]/80 mb-4 sm:mb-5 md:mb-6">
                    {category.subtext}
                  </p>

                  {/* Link */}
                  <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[#0d8bf2] text-sm sm:text-base font-semibold group-hover:gap-2 sm:group-hover:gap-3 transition-all">
                    Batafsil
                    <AltArrowRightBold className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
