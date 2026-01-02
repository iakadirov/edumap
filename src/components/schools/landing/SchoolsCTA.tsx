import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MagniferLinear, AddCircleBold, AltArrowRightLinear } from '@solar-icons/react-perf';

export function SchoolsCTA() {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      {/* For parents/students */}
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-[#0d8bf2] to-[#0066cc] p-5 sm:p-6 md:p-8 lg:p-10 text-white group">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle */}
          <div className="absolute -top-12 sm:-top-20 -right-12 sm:-right-20 w-40 sm:w-64 h-40 sm:h-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 sm:-bottom-10 -left-6 sm:-left-10 w-24 sm:w-40 h-24 sm:h-40 rounded-full bg-white/5" />

          {/* Grid pattern - hidden on mobile for cleaner look */}
          <div
            className="hidden sm:block absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Floating shapes - hidden on mobile */}
          <div className="hidden sm:block absolute top-1/4 right-1/4 w-4 h-4 bg-white/20 rounded-lg rotate-45 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="hidden sm:block absolute bottom-1/3 left-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <MagniferLinear className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>

          {/* Text */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              Maktablarni qidiring
            </h3>
            <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed">
              500+ maktab, shaffof ma'lumotlar va haqiqiy sharhlar
            </p>
          </div>

          {/* Button */}
          <Button
            asChild
            size="lg"
            className="bg-white text-[#0d8bf2] hover:bg-white/90 rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-black/10 group/btn text-sm sm:text-base h-10 sm:h-11 md:h-12 px-4 sm:px-6"
          >
            <Link href="/schools/list" className="inline-flex items-center gap-1.5 sm:gap-2">
              Maktablar katalogi
              <AltArrowRightLinear className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* For institutions */}
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-5 sm:p-6 md:p-8 lg:p-10 text-white group">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle */}
          <div className="absolute -top-12 sm:-top-20 -right-12 sm:-right-20 w-40 sm:w-64 h-40 sm:h-64 rounded-full bg-[#0d8bf2]/10" />
          <div className="absolute -bottom-6 sm:-bottom-10 -left-6 sm:-left-10 w-24 sm:w-40 h-24 sm:h-40 rounded-full bg-[#0d8bf2]/5" />

          {/* Grid pattern - hidden on mobile */}
          <div
            className="hidden sm:block absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0d8bf2] via-[#38bdf8] to-[#0d8bf2]" />

          {/* Floating shapes - hidden on mobile */}
          <div className="hidden sm:block absolute top-1/3 right-1/4 w-4 h-4 bg-[#38bdf8]/30 rounded-lg rotate-12 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="hidden sm:block absolute bottom-1/4 left-1/4 w-3 h-3 bg-[#0d8bf2]/20 rounded-full animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0d8bf2]/30 to-[#38bdf8]/30 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <AddCircleBold className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>

          {/* Text */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
              Maktabingizni qo'shing
            </h3>
            <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">
              Minglab ota-onalar sizni qidiryapti
            </p>
          </div>

          {/* Button */}
          <Button
            asChild
            size="lg"
            className="bg-white text-[#1e293b] hover:bg-white/90 rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-black/10 group/btn text-sm sm:text-base h-10 sm:h-11 md:h-12 px-4 sm:px-6"
          >
            <Link href="/register" className="inline-flex items-center gap-1.5 sm:gap-2">
              Bepul ro'yxatdan o'tish
              <AltArrowRightLinear className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
