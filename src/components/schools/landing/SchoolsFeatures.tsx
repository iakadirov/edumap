import {
  ShieldCheckBold,
  ChatSquareBold,
  MagniferBold,
  GiftBold,
} from '@solar-icons/react-perf';
import { SectionHeader, SectionContent } from '@/components/ui/section';

const features = [
  {
    id: 'transparent',
    title: "Shaffof ma'lumotlar",
    description: "Barcha maktablar haqida to'liq ma'lumot: o'quv dasturi, narxlar, infrastruktura va natijalar",
    icon: ShieldCheckBold,
    color: '#0d8bf2',
  },
  {
    id: 'reviews',
    title: "Haqiqiy sharhlar",
    description: "Tasdiqlangan ota-onalar va o'quvchilarning haqiqiy fikrlari va tajribasi",
    icon: ChatSquareBold,
    color: '#31ab08',
  },
  {
    id: 'search',
    title: "Qulay qidiruv",
    description: "Kuchli filterlar: hudud, narx, til, o'quv dasturi va boshqalar bo'yicha qidiring",
    icon: MagniferBold,
    color: '#0284c7',
  },
  {
    id: 'free',
    title: "Bepul xizmat",
    description: "Barcha ma'lumotlar va qidiruv xizmatlari to'liq bepul",
    icon: GiftBold,
    color: '#ef6e2e',
  },
];

export function SchoolsFeatures() {
  return (
    <SectionContent>
      <SectionHeader
        title="Nega aynan EduMap?"
        subtitle="Maktabni to'g'ri tanlash uchun barcha kerakli narsalar"
      />

      {/* Features grid - 2x2 on desktop */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="group relative bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
            >
              {/* Subtle gradient overlay on hover */}
              <div
                className="absolute inset-0 rounded-[20px] sm:rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}05 0%, transparent 100%)`
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}12` }}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: feature.color }} />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-[#0c1319]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#5a6c7d] text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative corner accent */}
              <div
                className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr-[20px] sm:rounded-tr-[24px]"
                style={{
                  background: `radial-gradient(circle at top right, ${feature.color}08 0%, transparent 70%)`
                }}
              />
            </div>
          );
        })}
      </div>
    </SectionContent>
  );
}
