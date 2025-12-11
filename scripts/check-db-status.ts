#!/usr/bin/env tsx
/**
 * Скрипт для проверки статуса базы данных Supabase
 * 
 * Использование:
 *   npx tsx scripts/check-db-status.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Ошибка: Не найдены переменные окружения\n');
  console.log('Нужно в .env.local:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  try {
    console.log('\n🔍 Проверка статуса базы данных...\n');
    console.log(`URL: ${SUPABASE_URL?.substring(0, 40)}...\n`);

    // Проверяем таблицу organizations
    console.log('📊 Проверка таблицы organizations...');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, slug, status')
      .limit(10);

    if (orgsError) {
      console.error('❌ Ошибка при чтении organizations:', orgsError.message);
      console.log('\n💡 Возможно, таблица еще не создана или RLS блокирует доступ.\n');
    } else {
      console.log(`✅ Таблица organizations существует`);
      console.log(`   Найдено записей: ${orgs?.length || 0}`);
      if (orgs && orgs.length > 0) {
        console.log('\n   Первые записи:');
        orgs.slice(0, 5).forEach((org, i) => {
          console.log(`   ${i + 1}. ${org.name} (${org.slug}) - ${org.status}`);
        });
      }
    }

    // Проверяем таблицу school_details
    console.log('\n📊 Проверка таблицы school_details...');
    const { data: schools, error: schoolsError } = await supabase
      .from('school_details')
      .select('id, school_type, grade_from, grade_to')
      .limit(10);

    if (schoolsError) {
      console.error('❌ Ошибка при чтении school_details:', schoolsError.message);
    } else {
      console.log(`✅ Таблица school_details существует`);
      console.log(`   Найдено записей: ${schools?.length || 0}`);
      if (schools && schools.length > 0) {
        console.log('\n   Первые записи:');
        schools.slice(0, 5).forEach((school, i) => {
          console.log(`   ${i + 1}. ${school.school_type} - классы ${school.grade_from}-${school.grade_to}`);
        });
      }
    }

    console.log('\n' + '─'.repeat(80));
    
    if (orgs && orgs.length > 0 && schools && schools.length > 0) {
      console.log('\n✅ База данных настроена и содержит данные!');
      console.log('   Все готово для работы.\n');
    } else if (orgs && orgs.length === 0) {
      console.log('\n⚠️  Таблицы существуют, но данных нет.');
      console.log('   Выполните миграцию с тестовыми данными:\n');
      console.log('   1. Откройте Supabase Dashboard → SQL Editor');
      console.log('   2. Выполните: supabase/migrations/002_insert_test_schools.sql\n');
    } else {
      console.log('\n⚠️  Проблема с доступом к базе данных.');
      console.log('   Проверьте настройки RLS или выполните миграции заново.\n');
    }

  } catch (error) {
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  }
}

main().catch(console.error);

