'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { StarBold } from '@solar-icons/react-perf';
import { SectionHeader, SectionContent } from '@/components/ui/section';

const testimonials = [
  {
    id: 1,
    text: "EduMap orqali farzandim uchun eng yaxshi maktabni topdim. Barcha ma'lumotlar bir joyda - narxlar, sharhlar, o'quv dasturi. Juda qulay!",
    author: 'Aziza Karimova',
    role: 'Ota-ona',
    location: 'Toshkent',
    rating: 5,
    color: '#0d8bf2',
  },
  {
    id: 2,
    text: "3 ta maktabni solishtirib ko'rdim va eng mosini tanladim. Ota-onalar sharhlari juda foydali bo'ldi. Rahmat EduMap!",
    author: "Sardor Rahmonov",
    role: 'Ota-ona',
    location: 'Samarqand',
    rating: 5,
    color: '#31ab08',
  },
  {
    id: 3,
    text: "Xususiy maktablar narxlarini taqqoslash imkoniyati juda yaxshi. Endi boshqa saytlarni qidirish shart emas, barchasi shu yerda.",
    author: 'Nilufar Abdullayeva',
    role: 'Ota-ona',
    location: "Buxoro",
    rating: 5,
    color: '#0284c7',
  },
  {
    id: 4,
    text: "Bolam uchun ingliz tilida o'qitiladigan maktab qidirdim. Filterlar orqali tez topdim. Platforma juda oson va tushunarli.",
    author: 'Jamshid Toshmatov',
    role: "Ota-ona",
    location: 'Toshkent',
    rating: 5,
    color: '#ef6e2e',
  },
];

export function SchoolsTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <SectionContent>
      <SectionHeader
        title="Ota-onalar fikrlari"
        subtitle="EduMap orqali maktab topgan ota-onalar tajribasi"
      />

      {/* Testimonial card */}
      <div className="max-w-3xl mx-auto px-2">
        <div
          className="relative bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 md:p-10 shadow-sm border border-gray-100 transition-all duration-500"
          style={{
            boxShadow: `0 4px 24px ${activeTestimonial.color}08`
          }}
        >
          {/* Quote icon */}
          <div
            className="absolute top-4 sm:top-6 right-4 sm:right-6 text-4xl sm:text-5xl md:text-6xl font-serif leading-none opacity-10 select-none"
            style={{ color: activeTestimonial.color }}
          >
            &ldquo;
          </div>

          {/* Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quote text */}
            <p className="text-base sm:text-lg md:text-xl text-[#0c1319] leading-relaxed pr-8 sm:pr-12">
              &ldquo;{activeTestimonial.text}&rdquo;
            </p>

            {/* Author and rating row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
              {/* Author info */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg transition-colors duration-500 flex-shrink-0"
                  style={{ backgroundColor: activeTestimonial.color }}
                >
                  {activeTestimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-[#0c1319]">{activeTestimonial.author}</p>
                  <p className="text-xs sm:text-sm text-[#5a6c7d]">
                    {activeTestimonial.role}, {activeTestimonial.location}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(activeTestimonial.rating)].map((_, i) => (
                  <StarBold key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {testimonials.map((testimonial, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              'h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer',
              index === activeIndex
                ? 'w-6 sm:w-8'
                : 'w-2 sm:w-2.5 bg-gray-200 hover:bg-gray-300'
            )}
            style={{
              backgroundColor: index === activeIndex ? testimonial.color : undefined
            }}
            aria-label={`Sharh ${index + 1}`}
          />
        ))}
      </div>
    </SectionContent>
  );
}
