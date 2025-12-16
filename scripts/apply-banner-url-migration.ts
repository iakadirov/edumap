import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Не найдены переменные окружения');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const migrationSQL = readFileSync(
    join(process.cwd(), 'supabase/migrations/034_add_banner_url.sql'),
    'utf-8'
  );

  console.log('📋 Применение миграции 034_add_banner_url.sql...\n');
  console.log('SQL:');
  console.log(migrationSQL);
  console.log('\n⚠️  Supabase JS клиент не поддерживает выполнение произвольного SQL.');
  console.log('💡 Выполните SQL выше в Supabase Dashboard → SQL Editor\n');
  
  // Альтернатива: можно использовать Supabase Management API
  // Но проще всего выполнить вручную через Dashboard
}

main().catch(console.error);

