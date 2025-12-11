#!/usr/bin/env tsx
/**
 * Скрипт для создания следующих важных задач в Linear
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createIssue, getTeams } from '../src/lib/linear';

const TEAM_ID = '2842cd16-4ff6-4959-8d9e-d633dd7ee812'; // Edumap (EDU)

const nextStepsTasks = [
  {
    title: '[UI] Создать Layout компонент',
    description: `Создать основной Layout компонент для приложения.

Требования:
- Обертка для всех страниц
- Responsive дизайн (mobile-first)
- Поддержка структуры: Header + Main + Footer
- Использовать shadcn/ui компоненты
- Добавить мета-теги через Next.js Metadata API

Файлы:
- src/components/shared/Layout.tsx
- Обновить src/app/layout.tsx для использования Layout

Ссылки:
- docs/CURRENT_SPRINT.md → UI Foundation
- shadcn/ui documentation`,
    priority: 3, // High
  },
  {
    title: '[UI] Создать Header с навигацией',
    description: `Создать Header компонент с навигацией и логотипом.

Требования:
- Логотип EduMap.uz (можно временно текст)
- Основная навигация: Главная, Школы, О проекте
- Мобильное меню (hamburger menu)
- Responsive дизайн
- Использовать shadcn/ui компоненты (Navigation Menu)

Файлы:
- src/components/shared/Header.tsx
- Добавить в Layout компонент

Компоненты shadcn/ui:
- npx shadcn@latest add navigation-menu

Ссылки:
- docs/CURRENT_SPRINT.md → UI Foundation`,
    priority: 3, // High
  },
  {
    title: '[UI] Создать Footer компонент',
    description: `Создать Footer компонент с информацией о проекте.

Требования:
- Информация о проекте EduMap.uz
- Ссылки: О проекте, Контакты, Политика конфиденциальности
- Социальные сети (если есть)
- Copyright
- Responsive дизайн

Файлы:
- src/components/shared/Footer.tsx
- Добавить в Layout компонент

Ссылки:
- docs/CURRENT_SPRINT.md → UI Foundation`,
    priority: 2, // Medium
  },
  {
    title: '[UI] Создать главную страницу (Hero section)',
    description: `Обновить главную страницу с красивым Hero section.

Требования:
- Заголовок и описание EduMap.uz
- Призыв к действию (CTA): "Найти школу", "Каталог школ"
- Красивый дизайн с градиентами/иконками
- Использовать Tailwind CSS v4
- Responsive дизайн

Файлы:
- Обновить src/app/page.tsx
- Возможно: src/components/home/Hero.tsx

Ссылки:
- docs/CURRENT_SPRINT.md → UI Foundation
- Текущая версия: https://edumap-roan.vercel.app/`,
    priority: 3, // High
  },
  {
    title: '[UI] Настроить базовые цвета и типографику',
    description: `Настроить дизайн-систему: цвета и типографика.

Требования:
- Определить цветовую палитру проекта
- Настроить тему в tailwind.config.ts
- Типографика: шрифты, размеры, line-height
- Использовать CSS переменные для тем (light/dark опционально)
- Обновить globals.css

Файлы:
- src/app/globals.css
- tailwind.config.ts (если нужен)

Цвета:
- Primary: образовательная тема (синий/зеленый)
- Secondary, accent, muted
- Background, foreground

Ссылки:
- Tailwind CSS v4 documentation
- shadcn/ui theme customization`,
    priority: 2, // Medium
  },
  {
    title: '[SCHOOLS] Создать страницу списка школ',
    description: `Создать страницу каталога школ /schools.

Требования:
- Страница: src/app/(main)/schools/page.tsx
- Получить данные из Supabase через getActiveSchools()
- Отобразить список школ (пока без карточек)
- Добавить базовую пагинацию (если > 10 школ)
- Обработка состояний: loading, error, empty

Интеграция:
- Использовать src/lib/supabase/queries.ts → getActiveSchools()
- Server Component для получения данных

Ссылки:
- docs/modules/schools/README.md
- docs/NEXT_STEPS.md → Каталог школ`,
    priority: 3, // High
  },
  {
    title: '[SCHOOLS] Создать компонент SchoolCard',
    description: `Создать компонент карточки школы для списка.

Требования:
- Отображение: название, логотип, рейтинг, адрес
- Тип школы (private/state/international)
- Цена (fee_monthly_min - fee_monthly_max)
- Ссылка на профиль школы
- Hover эффекты
- Responsive дизайн

Файлы:
- src/components/schools/SchoolCard.tsx
- Использовать shadcn/ui Card компонент

Данные:
- Тип: Organization + SchoolDetails из Supabase
- См. src/types/database.ts

Компоненты shadcn/ui:
- npx shadcn@latest add card

Ссылки:
- docs/modules/schools/README.md → Компоненты UI`,
    priority: 3, // High
  },
  {
    title: '[SCHOOLS] Создать компонент SchoolFilters',
    description: `Создать панель фильтров для поиска школ.

Требования:
- Фильтры: район, город, тип школы, цена, язык, curriculum
- Использовать URL search params для состояния фильтров
- Кнопка "Сбросить фильтры"
- Показывать количество найденных школ
- Использовать shadcn/ui Select, Checkbox компоненты

Файлы:
- src/components/schools/SchoolFilters.tsx
- Обновить /schools/page.tsx для использования фильтров
- Использовать getSchoolsWithFilters() из queries.ts

Компоненты shadcn/ui:
- npx shadcn@latest add select
- npx shadcn@latest add checkbox

Ссылки:
- docs/modules/schools/README.md → Компоненты UI
- src/lib/supabase/queries.ts → getSchoolsWithFilters()`,
    priority: 2, // Medium
  },
];

async function main() {
  try {
    console.log('\n📋 Создание следующих важных задач в Linear...\n');
    
    const teams = await getTeams();
    const team = teams.find(t => t.id === TEAM_ID) || teams[0];
    
    if (!team) {
      console.error('❌ Команда не найдена');
      process.exit(1);
    }
    
    console.log(`📁 Команда: ${team.name} (${team.key})\n`);
    console.log(`📝 Создаю ${nextStepsTasks.length} задач...\n`);
    console.log('─'.repeat(80));
    
    const createdIssues = [];
    
    for (const task of nextStepsTasks) {
      try {
        const issue = await createIssue({
          teamId: team.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
        });
        
        createdIssues.push(issue);
        console.log(`\n✅ ${issue.identifier}: ${issue.title}`);
        console.log(`   Статус: ${issue.state.name}`);
        console.log(`   URL: ${issue.url}`);
      } catch (error) {
        console.error(`\n❌ Ошибка при создании задачи "${task.title}":`, error);
      }
    }
    
    console.log('\n' + '─'.repeat(80));
    console.log(`\n✅ Успешно создано задач: ${createdIssues.length} из ${nextStepsTasks.length}\n`);
    
    if (createdIssues.length > 0) {
      console.log('💡 Совет: Назначьте задачи на Cursor для автоматической работы:\n');
      createdIssues.forEach(issue => {
        console.log(`   - ${issue.identifier}: ${issue.url}`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  }
}

main().catch(console.error);

