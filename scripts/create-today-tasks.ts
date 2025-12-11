#!/usr/bin/env tsx
/**
 * Скрипт для создания задач на сегодня из CURRENT_SPRINT.md
 * 
 * Использование:
 *   npx tsx scripts/create-today-tasks.ts
 * 
 * Требуется:
 *   - LINEAR_API_KEY в .env.local
 *   - ID команды (teamId) в Linear
 */

import { createIssue, getTeams } from '../src/lib/linear';

// Задачи на сегодня (13 декабря 2025) - следующий шаг после инициализации
const tasksForToday = [
  {
    title: '[DB] Создать проект в Supabase',
    description: `Создать новый проект в Supabase для EduMap.uz.

Требования:
- Название проекта: EduMap
- Регион: ближайший к Узбекистану
- Настроить базу данных PostgreSQL

После создания сохранить URL и API ключи в .env.local`,
    priority: 3, // High
  },
  {
    title: '[DB] Спроектировать таблицы organizations и school_details',
    description: `Создать схему базы данных для модуля школ.

Таблицы:
1. organizations (общая таблица)
   - id, org_type, name, slug
   - description, logo_url
   - phone, email, website
   - address, district, city, lat, lng
   - status, is_verified
   - overall_rating, reviews_count

2. school_details (специфичная для школ)
   - school_type (private, state, international)
   - grade_from, grade_to
   - total_students, avg_class_size
   - primary_language, additional_languages
   - curriculum (national, cambridge, ib)
   - fee_monthly_min, fee_monthly_max
   - has_transport, has_meals, has_extended_day

См. документацию: docs/modules/schools/README.md`,
    priority: 3, // High
  },
  {
    title: '[DB] Создать первую миграцию для таблиц школ',
    description: `Создать SQL миграцию для создания таблиц organizations и school_details.

Требования:
- Использовать Supabase migrations
- Добавить индексы для поиска
- Настроить foreign keys
- Добавить constraints для валидации данных

Файл: supabase/migrations/001_create_organizations_and_schools.sql`,
    priority: 2, // Medium
  },
  {
    title: '[SETUP] Настроить Supabase клиент в проекте',
    description: `Настроить подключение к Supabase в Next.js проекте.

Требования:
- Установить @supabase/supabase-js
- Создать клиент в src/lib/supabase/client.ts
- Настроить переменные окружения
- Создать типы TypeScript для таблиц
- Добавить helper функции для работы с БД`,
    priority: 3, // High
  },
  {
    title: '[UI] Создать базовый Layout компонент',
    description: `Создать основной Layout компонент для приложения.

Требования:
- Обертка для всех страниц
- Поддержка темной/светлой темы (опционально)
- Responsive дизайн
- Использовать shadcn/ui компоненты

Файл: src/components/shared/Layout.tsx`,
    priority: 2, // Medium
  },
];

async function main() {
  try {
    console.log('\n📋 Создание задач на сегодня (13 декабря 2025)\n');

    // Получаем список команд
    const teams = await getTeams();
    
    if (teams.length === 0) {
      console.error('❌ Команды не найдены в Linear');
      process.exit(1);
    }

    // Используем первую команду (или можно выбрать по ключу)
    const team = teams.find(t => t.key === 'EDU') || teams[0];
    
    console.log(`📁 Команда: ${team.name} (${team.key})\n`);
    console.log('─'.repeat(80));

    // Создаем задачи
    const createdIssues = [];
    
    for (const task of tasksForToday) {
      try {
        console.log(`\n📌 Создаю: ${task.title}...`);
        
        const issue = await createIssue({
          teamId: team.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
        });

        createdIssues.push(issue);
        console.log(`✅ Создана: ${issue.identifier}`);
        console.log(`   URL: ${issue.url}`);
      } catch (error) {
        console.error(`❌ Ошибка при создании "${task.title}":`, error);
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n✅ Создано задач: ${createdIssues.length} из ${tasksForToday.length}\n`);

    if (createdIssues.length > 0) {
      console.log('📋 Список созданных задач:');
      createdIssues.forEach(issue => {
        console.log(`   - ${issue.identifier}: ${issue.title}`);
        console.log(`     ${issue.url}`);
      });
      console.log('');
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('LINEAR_API_KEY')) {
      console.error('\n❌ Ошибка: API ключ Linear не найден\n');
      console.log('📖 Для создания задач через API нужно:');
      console.log('   1. Получить API ключ: Linear → Settings → API → Personal API keys');
      console.log('   2. Создать файл .env.local');
      console.log('   3. Добавить: LINEAR_API_KEY=your_api_key\n');
      console.log('💡 Или создайте задачи вручную в Linear:\n');
      tasksForToday.forEach(task => {
        console.log(`   - ${task.title}`);
      });
      console.log('');
      process.exit(1);
    }
    
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  }
}

main().catch(console.error);

