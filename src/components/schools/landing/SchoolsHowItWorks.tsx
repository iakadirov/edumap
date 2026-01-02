'use client';

import {
  MagniferBold,
  SortHorizontalBold,
  CheckCircleBold,
} from '@solar-icons/react-perf';
import { SectionHeader, SectionContent } from '@/components/ui/section';

const steps = [
  {
    id: 1,
    title: 'Qidiring',
    description: "Hudud, narx, til yoki o'quv dasturi bo'yicha kerakli maktablarni toping",
    icon: MagniferBold,
    color: '#0d8bf2',
  },
  {
    id: 2,
    title: 'Solishtiring',
    description: "Narxlar, reytinglar, sharhlar va xususiyatlarni bir-biri bilan taqqoslang",
    icon: SortHorizontalBold,
    color: '#0284c7',
  },
  {
    id: 3,
    title: 'Tanlang',
    description: "Eng mos maktabni tanlang va to'g'ridan-to'g'ri bog'laning",
    icon: CheckCircleBold,
    color: '#31ab08',
  },
];

export function SchoolsHowItWorks() {
  return (
    <SectionContent className="scroll-mt-24" id="how-it-works">
      <SectionHeader
        title="Qanday ishlaydi?"
        subtitle="3 oddiy qadamda ideal maktabni toping"
      />

      {/* Steps */}
      <div className="relative max-w-4xl mx-auto">
        {/* Connection line (desktop) - gradient */}
        <div className="hidden md:block absolute top-[50px] sm:top-[60px] left-[16.67%] right-[16.67%] h-1">
          <div className="w-full h-full bg-gradient-to-r from-[#0d8bf2] via-[#0284c7] to-[#31ab08] rounded-full opacity-20" />
          {/* Animated progress dots */}
          <div className="absolute inset-0 flex justify-between px-4">
            <div className="w-2 h-2 rounded-full bg-[#0d8bf2] -translate-y-0.5 animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-[#0284c7] -translate-y-0.5 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="w-2 h-2 rounded-full bg-[#31ab08] -translate-y-0.5 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative group">
                {/* Vertical line for mobile */}
                {index < steps.length - 1 && (
                  <div
                    className="md:hidden absolute left-[24px] sm:left-[30px] top-[70px] sm:top-[80px] w-0.5 sm:w-1 h-12 sm:h-16 rounded-full"
                    style={{
                      background: `linear-gradient(to bottom, ${step.color}, ${steps[index + 1].color})`
                    }}
                  />
                )}

                <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
                  {/* Step icon container */}
                  <div className="relative z-10 md:mb-4 sm:md:mb-6 flex-shrink-0">
                    {/* Outer ring with gradient */}
                    <div
                      className="w-[56px] h-[56px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] rounded-2xl sm:rounded-3xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}15 0%, ${step.color}05 100%)`
                      }}
                    >
                      {/* Inner icon container */}
                      <div
                        className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{
                          boxShadow: `0 8px 32px ${step.color}20`
                        }}
                      >
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10" style={{ color: step.color }} />
                      </div>
                    </div>

                    {/* Step number badge */}
                    <div
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-sm sm:text-base md:text-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: step.color,
                        boxShadow: `0 4px 12px ${step.color}40`
                      }}
                    >
                      {step.id}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:flex-none">
                    <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-[#0c1319]">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#5a6c7d] md:max-w-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContent>
  );
}
