import {
  MagniferBold,
  SortHorizontalBold,
  CheckCircleBold,
} from '@solar-icons/react-perf';

const steps = [
  {
    id: 1,
    title: 'Qidiring',
    description: "Kerakli muassasani toping filterlar yordamida",
    icon: MagniferBold,
  },
  {
    id: 2,
    title: 'Solishtiring',
    description: "Narxlar, fikrlar va xususiyatlarni solishtiring",
    icon: SortHorizontalBold,
  },
  {
    id: 3,
    title: 'Tanlang',
    description: "To'g'ri qaror qiling va muassasa bilan bog'laning",
    icon: CheckCircleBold,
  },
];

export function HowItWorks() {
  return (
    <div className="space-y-12">
      {/* Section header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Qanday ishlaydi?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          3 oddiy qadamda ideal ta'lim muassasasini toping
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connection line (desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

        <div className="grid gap-8 md:grid-cols-3 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Vertical line for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden absolute left-6 top-16 w-0.5 h-16 bg-border" />
                )}

                <div className="flex flex-col items-center text-center">
                  {/* Step number with icon */}
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-lg">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {step.id}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
