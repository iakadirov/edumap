'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SchoolSidebar } from './SchoolSidebar';
import { Badge } from '@/components/ui/badge';
import {
  FileTextBold,
  BookBold,
  UserHandsBold,
  BuildingsBold,
  ChatSquareBold,
  FileCheckBold,
  WalletBold,
} from '@solar-icons/react-perf';
import type { SchoolProfile } from '@/types/school';

// Импорты табов
import { AboutTab } from './tabs/AboutTab';
import { ProgramTab } from './tabs/ProgramTab';
import { TeachersTab } from './tabs/TeachersTab';
import { InfrastructureTab } from './tabs/InfrastructureTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { AdmissionTab } from './tabs/AdmissionTab';
import { PricingTab } from './tabs/PricingTab';

interface SchoolProfileLayoutProps {
  school: SchoolProfile;
  onCompareToggle?: () => void;
  onSaveToggle?: () => void;
  isInComparison?: boolean;
  isSaved?: boolean;
}

/**
 * Layout страницы профиля школы с табами и sidebar
 * 
 * Включает:
 * - Навигация табов (адаптивный дизайн без горизонтального скролла)
 * - Контент табов
 * - Sidebar (sticky на desktop, под контентом на mobile)
 */
export function SchoolProfileLayout({
  school,
  onCompareToggle,
  onSaveToggle,
  isInComparison,
  isSaved,
}: SchoolProfileLayoutProps) {
  const [activeTab, setActiveTab] = useState('about');
  
  const tabs = [
    { id: 'about', label: 'О школе', icon: FileTextBold },
    { id: 'program', label: 'Программа', icon: BookBold },
    { id: 'teachers', label: 'Учителя', icon: UserHandsBold },
    { id: 'infrastructure', label: 'Инфраструктура', icon: BuildingsBold },
    { id: 'reviews', label: 'Отзывы', icon: ChatSquareBold, count: school.rating.reviewCount },
    { id: 'admission', label: 'Поступление', icon: FileCheckBold },
    { id: 'pricing', label: 'Цены', icon: WalletBold },
  ];
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="overflow-x-auto scrollbar-hide scroll-smooth">
              <TabsList className="w-full h-auto bg-transparent p-0 justify-start gap-0 min-w-max md:min-w-0 md:w-full">
                <div className="flex gap-0">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="relative flex items-center gap-2 px-3 md:px-5 py-3.5 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:font-semibold border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none bg-transparent whitespace-nowrap transition-all duration-200 hover:bg-gray-50/50 data-[state=active]:bg-transparent flex-shrink-0"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden min-[420px]:inline">{tab.label}</span>
                        <span className="min-[420px]:hidden">{tab.label.split(' ')[0]}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="ml-1.5 h-5 min-w-[20px] px-1.5 text-xs font-normal bg-gray-100 text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 flex-shrink-0"
                          >
                            {tab.count}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </div>
              </TabsList>
            </div>
          </div>
          
          {/* Tab Contents */}
          <div>
            <TabsContent value="about" className="mt-0">
              <AboutTab school={school} />
            </TabsContent>
            <TabsContent value="program" className="mt-0">
              <ProgramTab school={school} />
            </TabsContent>
            <TabsContent value="teachers" className="mt-0">
              <TeachersTab school={school} />
            </TabsContent>
            <TabsContent value="infrastructure" className="mt-0">
              <InfrastructureTab school={school} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-0">
              <ReviewsTab school={school} />
            </TabsContent>
            <TabsContent value="admission" className="mt-0">
              <AdmissionTab school={school} />
            </TabsContent>
            <TabsContent value="pricing" className="mt-0">
              <PricingTab school={school} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="lg:sticky lg:top-24">
          <SchoolSidebar
            school={school}
            onCompareToggle={onCompareToggle}
            onSaveToggle={onSaveToggle}
            isInComparison={isInComparison}
            isSaved={isSaved}
          />
        </div>
      </aside>
    </div>
  );
}

