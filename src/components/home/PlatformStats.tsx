'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BuildingsBold,
  MapBold,
  ChatSquareBold,
  StarBold,
} from '@solar-icons/react-perf';

// Platform stats data
const stats = [
  {
    id: 'institutions',
    value: 2000,
    suffix: '+',
    label: "Ta'lim muassasalari",
    icon: BuildingsBold,
    color: '#0d8bf2',
  },
  {
    id: 'regions',
    value: 14,
    suffix: '',
    label: 'Viloyat va shahar',
    icon: MapBold,
    color: '#31ab08',
  },
  {
    id: 'reviews',
    value: 50,
    suffix: 'K+',
    label: 'Fikrlar va sharhlar',
    icon: ChatSquareBold,
    color: '#0284c7',
  },
  {
    id: 'rating',
    value: 4.8,
    suffix: '',
    label: "O'rtacha reyting",
    icon: StarBold,
    color: '#ef6e2e',
    isDecimal: true,
  },
];

function CountUp({
  end,
  duration = 2000,
  isDecimal = false,
}: {
  end: number;
  duration?: number;
  isDecimal?: boolean;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (end - startValue) * easeOutQuart;

      setCount(isDecimal ? Math.round(currentValue * 10) / 10 : Math.floor(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? count.toFixed(1) : count.toLocaleString()}
    </span>
  );
}

export function PlatformStats() {
  return (
    <div className="relative">
      {/* Background card */}
      <div className="absolute inset-0 bg-white rounded-[20px] sm:rounded-[24px] md:rounded-[32px] shadow-sm" />

      {/* Stats grid */}
      <div className="relative grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isLast = index === stats.length - 1;

          return (
            <div
              key={stat.id}
              className="relative p-4 sm:p-6 md:p-8 group"
            >
              {/* Vertical divider (desktop) */}
              {!isLast && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 sm:h-16 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
              )}

              {/* Horizontal divider for 2x2 grid (mobile/tablet) */}
              {index < 2 && (
                <div className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 sm:w-3/4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              )}

              {/* Vertical divider for 2x2 grid (mobile/tablet) */}
              {(index === 0 || index === 2) && (
                <div className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 sm:h-16 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
              )}

              <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                {/* Icon with colored background */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: stat.color }} />
                </div>

                {/* Number */}
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-2xl sm:text-3xl md:text-4xl font-bold"
                    style={{ color: stat.color }}
                  >
                    <CountUp end={stat.value} isDecimal={stat.isDecimal} />
                  </span>
                  {stat.suffix && (
                    <span
                      className="text-lg sm:text-xl md:text-2xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.suffix}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="text-xs sm:text-sm md:text-base font-medium text-[#5a6c7d]">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
