import {
  ShieldCheckBold,
  WalletBold,
  MagniferBold,
  ChatSquareBold,
  GiftBold,
  SmartphoneBold,
} from '@solar-icons/react-perf';

const features = [
  {
    id: 'verified',
    title: "Tekshirilgan ma'lumotlar",
    description: "Barcha muassasalar tekshirilgan va tasdiqlangan",
    icon: ShieldCheckBold,
    color: '#0d8bf2',
  },
  {
    id: 'pricing',
    title: "Shaffof narxlar",
    description: "O'quv to'lovlari ochiq va dolzarb",
    icon: WalletBold,
    color: '#31ab08',
  },
  {
    id: 'search',
    title: "Qulay qidiruv",
    description: "Filterlar va solishtirish imkoniyati",
    icon: MagniferBold,
    color: '#8147f5',
  },
  {
    id: 'reviews',
    title: "Haqiqiy fikrlar",
    description: "Ota-onalar va talabalarning haqiqiy sharhlari",
    icon: ChatSquareBold,
    color: '#ef6e2e',
  },
  {
    id: 'free',
    title: "Bepul foydalanish",
    description: "Qidiruv va ma'lumotlar to'liq bepul",
    icon: GiftBold,
    color: '#e91e63',
  },
  {
    id: 'mobile',
    title: "Mobil qurilmalar",
    description: "Istalgan qurilmada qulay foydalanish",
    icon: SmartphoneBold,
    color: '#00bcd4',
  },
];

export function FeaturesSection() {
  return (
    <div className="space-y-8 sm:space-y-10 md:space-y-12">
      {/* Section header */}
      <div className="text-center space-y-3 sm:space-y-4 px-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em] text-[#0c1319]">
          Nega aynan EduMap?
        </h2>
        <p className="text-base sm:text-lg text-[#5a6c7d] max-w-2xl mx-auto">
          Ta'lim muassasasini to'g'ri tanlash uchun barcha kerakli narsalar
        </p>
      </div>

      {/* Features grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="group relative bg-white rounded-[16px] sm:rounded-[20px] md:rounded-[24px] p-5 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
            >
              {/* Subtle gradient overlay on hover */}
              <div
                className="absolute inset-0 rounded-[16px] sm:rounded-[20px] md:rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}05 0%, transparent 100%)`
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}12` }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: feature.color }} />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 text-[#0c1319]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#5a6c7d] text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative corner accent */}
              <div
                className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr-[16px] sm:rounded-tr-[20px] md:rounded-tr-[24px]"
                style={{
                  background: `radial-gradient(circle at top right, ${feature.color}08 0%, transparent 70%)`
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
