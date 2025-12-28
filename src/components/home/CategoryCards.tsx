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
    color: '#8147f5',
    bgGradient: 'from-purple-50 to-purple-100/30',
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
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.04em] text-[#0c1319]">
          Ta'lim muassasalarini tanlang
        </h2>
        <p className="text-xl text-[#5a6c7d] max-w-2xl mx-auto">
          Barcha turdagi ta'lim muassasalari bitta platformada
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.id} href={category.href}>
              <Card className="group relative overflow-hidden p-8 h-full bg-[#fafdff] border border-[#d1d9e3] rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent">
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
                    className="w-16 h-16 rounded-[12px] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: category.color }} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold tracking-[-0.03em] mb-3 text-[#0c1319]">
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#5a6c7d] mb-2 text-lg">
                    {category.description}
                  </p>
                  <p className="text-sm text-[#5a6c7d]/80 mb-6">
                    {category.subtext}
                  </p>

                  {/* Link */}
                  <span className="inline-flex items-center gap-2 text-[#0d8bf2] font-semibold group-hover:gap-3 transition-all">
                    Batafsil
                    <AltArrowRightBold className="w-5 h-5" />
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
