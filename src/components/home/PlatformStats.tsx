'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BuildingsBold,
  MapBold,
  ChatSquareBold,
  StarBold,
} from '@solar-icons/react-perf';

const stats = [
  {
    id: 'institutions',
    value: 2000,
    suffix: '+',
    label: "Ta'lim muassasalari",
    icon: BuildingsBold,
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
  },
  {
    id: 'regions',
    value: 14,
    suffix: '',
    label: 'Viloyat va shahar',
    icon: MapBold,
    gradient: 'from-green-500 to-green-600',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600',
  },
  {
    id: 'reviews',
    value: 50,
    suffix: 'K+',
    label: 'Fikrlar va sharhlar',
    icon: ChatSquareBold,
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-600',
  },
  {
    id: 'rating',
    value: 4.8,
    suffix: '',
    label: "O'rtacha reyting",
    icon: StarBold,
    gradient: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
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

      // Easing function for smooth animation
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {/* Gradient accent line at top */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            
            <div className="flex flex-col gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>

              {/* Number */}
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  <CountUp end={stat.value} isDecimal={stat.isDecimal} />
                </span>
                {stat.suffix && (
                  <span className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.suffix}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="text-sm md:text-base font-medium text-gray-600">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
