'use client';

import Link from 'next/link';
import {
  BookBold,
  ShieldCheckBold,
  GlobalLinear,
  MapPointBold,
} from '@solar-icons/react-perf';
import { SectionHeader, SectionContent } from '@/components/ui/section';

const filterGroups = [
  {
    id: 'type',
    title: "Maktab turi bo'yicha",
    icon: BookBold,
    color: '#0d8bf2',
    filters: [
      { label: 'Davlat maktablari', href: '/schools/list?school_type=state' },
      { label: 'Xususiy maktablar', href: '/schools/list?school_type=private' },
      { label: 'Xalqaro maktablar', href: '/schools/list?school_type=international' },
      { label: 'Ixtisoslashgan', href: '/schools/list?school_type=specialized' },
    ],
  },
  {
    id: 'language',
    title: "O'qitish tili bo'yicha",
    icon: GlobalLinear,
    color: '#31ab08',
    filters: [
      { label: "O'zbek tilida", href: '/schools/list?language=uzbek' },
      { label: 'Rus tilida', href: '/schools/list?language=russian' },
      { label: 'Ingliz tilida', href: '/schools/list?language=english' },
      { label: 'Ko\'p tilda', href: '/schools/list?language=multilingual' },
    ],
  },
  {
    id: 'curriculum',
    title: "Dastur bo'yicha",
    icon: ShieldCheckBold,
    color: '#0284c7',
    filters: [
      { label: 'Milliy dastur', href: '/schools/list?curriculum=national' },
      { label: 'Cambridge', href: '/schools/list?curriculum=cambridge' },
      { label: 'IB (International Baccalaureate)', href: '/schools/list?curriculum=ib' },
      { label: 'Amerika dasturi', href: '/schools/list?curriculum=american' },
    ],
  },
  {
    id: 'region',
    title: "Hudud bo'yicha",
    icon: MapPointBold,
    color: '#ef6e2e',
    filters: [
      { label: 'Toshkent shahri', href: '/schools/list?region=1' },
      { label: 'Toshkent viloyati', href: '/schools/list?region=2' },
      { label: 'Samarqand', href: '/schools/list?region=7' },
      { label: 'Buxoro', href: '/schools/list?region=4' },
    ],
  },
];

export function QuickFilters() {
  return (
    <SectionContent>
      <SectionHeader
        title="Tezkor qidiruv"
        subtitle="Kerakli maktablarni tez toping"
      />

      {/* Filter groups grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {filterGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.id}
              className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 border border-gray-100"
            >
              {/* Group header */}
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${group.color}12` }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: group.color }} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#0c1319]">
                  {group.title}
                </h3>
              </div>

              {/* Filter links */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {group.filters.map((filter) => (
                  <Link
                    key={filter.href}
                    href={filter.href}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm sm:text-base text-[#0c1319] font-medium transition-colors hover:shadow-sm"
                  >
                    {filter.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionContent>
  );
}
