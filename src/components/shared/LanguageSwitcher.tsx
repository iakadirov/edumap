'use client';

import { Button } from '@/components/ui/button';
import { GlobusBold } from '@solar-icons/react-perf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Компонент переключения языка
 */
export function LanguageSwitcher() {
  // TODO: Реализовать логику переключения языка через контекст или i18n
  const currentLanguage = 'ru'; // Временное значение

  const languages = [
    { code: 'uz', name: "O'zbek" },
    { code: 'ru', name: 'Русский' },
  ];

  const currentLangName = languages.find(lang => lang.code === currentLanguage)?.name || 'Русский';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-[12px] gap-1"
        >
          <GlobusBold className="h-5 w-5 text-slate-600" />
          <span className="text-base font-medium text-slate-600">
            {currentLangName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              // TODO: Реализовать переключение языка
              console.log('Switch to:', lang.code);
            }}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

