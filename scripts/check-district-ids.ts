import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Проверка district_id для миграции:\n');

  const checks = [
    { region: 11, soato: 1726273, name: 'Mirobod tumani' },
    { region: 11, soato: 1726266, name: 'Yunusobod tumani' },
    { region: 11, soato: 1726277, name: 'Shayxontohur tumani' },
    { region: 11, soato: 1726294, name: 'Chilonzor tumani' },
    { region: 11, soato: 1726262, name: 'Uchtepa tumani' },
    { region: 11, soato: 1726269, name: 'Mirzo Ulug\'bek tumani' },
    { region: 2, soato: 1703401, name: 'Andijon shahri', type: 'shahar' },
    { region: 8, soato: 1718401, name: 'Samarqand shahri', type: 'shahar' },
    { region: 13, soato: 1730401, name: 'Farg\'ona shahri', type: 'shahar' },
    { region: 3, soato: 1706401, name: 'Buxoro shahri', type: 'shahar' },
    { region: 12, soato: 1727401, name: 'Nurafshon', type: 'shahar' },
  ];

  for (const check of checks) {
    let query = supabase
      .from('districts')
      .select('id, name_uz, name_ru, soato_id, district_type')
      .eq('region_id', check.region)
      .eq('soato_id', check.soato);

    if (check.type) {
      query = query.eq('district_type', check.type);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      console.log(`❌ ${check.name.padEnd(30)} | NOT FOUND`);
    } else {
      console.log(`✅ ${check.name.padEnd(30)} | ID: ${data.id} | ${data.name_uz}`);
    }
  }
}

main().catch(console.error);

