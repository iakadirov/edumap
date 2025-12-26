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
  },
  {
    id: 'pricing',
    title: "Shaffof narxlar",
    description: "O'quv to'lovlari ochiq va dolzarb",
    icon: WalletBold,
  },
  {
    id: 'search',
    title: "Qulay qidiruv",
    description: "Filterlar va solishtirish imkoniyati",
    icon: MagniferBold,
  },
  {
    id: 'reviews',
    title: "Haqiqiy fikrlar",
    description: "Ota-onalar va talabalarning haqiqiy sharhlari",
    icon: ChatSquareBold,
  },
  {
    id: 'free',
    title: "Bepul foydalanish",
    description: "Qidiruv va ma'lumotlar to'liq bepul",
    icon: GiftBold,
  },
  {
    id: 'mobile',
    title: "Mobil qurilmalar",
    description: "Istalgan qurilmada qulay foydalanish",
    icon: SmartphoneBold,
  },
];

export function FeaturesSection() {
  return (
    <div className="space-y-12">
      {/* Section header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Nega aynan EduMap?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ta'lim muassasasini to'g'ri tanlash uchun barcha kerakli narsalar
        </p>
      </div>

      {/* Features grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.id} className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
