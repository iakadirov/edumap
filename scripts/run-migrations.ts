#!/usr/bin/env tsx
/**
 * Скрипт для автоматического выполнения миграций Supabase
 * 
 * Использование:
 *   npx tsx scripts/run-migrations.ts
 *   npx tsx scripts/run-migrations.ts --reset  # Пересоздать все таблицы
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Загружаем переменные окружения
import { config } from 'dotenv';
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ Ошибка: Не найдены переменные окружения\n');
  console.log('Нужно в .env.local:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (или используйте anon key)\n');
  console.log('💡 Service Role Key можно найти в:');
  console.log('   Supabase Dashboard → Settings → API → service_role key\n');
  process.exit(1);
}

// Создаем клиент с service_role для выполнения SQL
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSQL(sql: string, description: string): Promise<boolean> {
  try {
    console.log(`\n📋 ${description}...`);
    
    // Выполняем SQL через RPC или прямой запрос
    // Примечание: Supabase JS клиент не поддерживает произвольный SQL напрямую
    // Нужно использовать Supabase Management API или PostgreSQL драйвер
    
    // Для простоты, выведем SQL и инструкции
    console.log(`⚠️  Supabase JS клиент не поддерживает выполнение произвольного SQL.`);
    console.log(`📝 Используйте Supabase Dashboard → SQL Editor или Supabase CLI.\n`);
    
    return false;
  } catch (error) {
    console.error(`❌ Ошибка:`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes('--reset');

  console.log('\n🚀 Выполнение миграций Supabase\n');
  console.log(`URL: ${SUPABASE_URL?.substring(0, 30)}...`);

  if (reset) {
    console.log('\n⚠️  Режим RESET: таблицы будут удалены!\n');
    
    const resetSQL = readFileSync(
      join(process.cwd(), 'supabase/migrations/000_reset_tables.sql'),
      'utf-8'
    );
    
    console.log('📄 SQL для очистки:');
    console.log('─'.repeat(80));
    console.log(resetSQL);
    console.log('─'.repeat(80));
    console.log('\n💡 Скопируйте SQL выше и выполните в Supabase Dashboard → SQL Editor\n');
  }

  const migrationsDir = join(process.cwd(), 'supabase/migrations');
  const migrationFiles = [
    '001_create_tables_final.sql',
    '002_insert_test_schools.sql',
  ].filter(Boolean);

  console.log('\n📋 Миграции для выполнения:');
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  console.log('\n💡 Для автоматического выполнения миграций используйте:');
  console.log('   1. Supabase CLI: npx supabase db push');
  console.log('   2. Или скопируйте SQL из файлов и выполните в Dashboard\n');
}

main().catch(console.error);

