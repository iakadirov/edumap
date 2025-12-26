import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MagniferLinear, AddCircleBold } from '@solar-icons/react-perf';

export function HomeCTA() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* For parents/students */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-700 p-8 md:p-12 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <MagniferLinear className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold">
              Ta'lim muassasasini qidiring
            </h3>
            <p className="text-white/80 text-lg">
              Maktab, bog'cha, universitet yoki kurs — barchasi bir joyda
            </p>
          </div>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link href="/schools">Qidirishni boshlash</Link>
          </Button>
        </div>
      </div>

      {/* For institutions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-12 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <AddCircleBold className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold">
              Muassasangizni qo'shing
            </h3>
            <p className="text-white/80 text-lg">
              Minglab ota-onalar va talabalar sizni qidiryapti
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-white/90"
          >
            <Link href="/register">Bepul ro'yxatdan o'tish</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
