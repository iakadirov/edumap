'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StarBold } from '@solar-icons/react-perf';

const testimonials = [
  {
    id: 1,
    text: "EduMap orqali farzandim uchun eng yaxshi maktabni topdim. Juda qulay va oson! Barcha ma'lumotlar bir joyda va shaffof.",
    author: 'Aziza Karimova',
    role: 'Ota-ona',
    location: 'Toshkent',
    rating: 5,
  },
  {
    id: 2,
    text: "Universitetlarni solishtirish juda oson bo'ldi. Narxlar, reyting va sharhlar barchasi ochiq. Tavsiya qilaman!",
    author: "Jamshid Rahmonov",
    role: 'Talaba',
    location: 'Samarqand',
    rating: 5,
  },
  {
    id: 3,
    text: "Bolam uchun bog'cha qidirish qiyin edi, lekin EduMap yordamida tez va oson topdik. Rahmat!",
    author: 'Nilufar Abdullayeva',
    role: 'Ota-ona',
    location: "Buxoro",
    rating: 5,
  },
  {
    id: 4,
    text: "IT kurslari haqida to'liq ma'lumot olish uchun eng yaxshi platforma. Haqiqiy sharhlar juda foydali bo'ldi.",
    author: 'Sardor Toshmatov',
    role: "O'quvchi",
    location: 'Toshkent',
    rating: 5,
  },
];

export function Testimonials() {
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
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Foydalanuvchilar fikrlari
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ota-onalar va talabalar tajribasi
        </p>
      </div>

      {/* Testimonial card */}
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 md:p-12 text-center relative overflow-hidden">
          {/* Quote decoration */}
          <div className="absolute top-4 left-4 text-6xl text-primary/10 font-serif">
            &ldquo;
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-6">
            {/* Quote */}
            <p className="text-lg md:text-xl italic text-foreground/90">
              &ldquo;{activeTestimonial.text}&rdquo;
            </p>

            {/* Rating */}
            <div className="flex justify-center gap-1">
              {[...Array(activeTestimonial.rating)].map((_, i) => (
                <StarBold key={i} className="w-5 h-5 text-amber-400" />
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              {/* Avatar placeholder */}
              <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {activeTestimonial.author.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold">{activeTestimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {activeTestimonial.role}, {activeTestimonial.location}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              'w-2.5 h-2.5 rounded-[12px] transition-all',
              index === activeIndex
                ? 'bg-primary w-8'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            aria-label={`Sharh ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
