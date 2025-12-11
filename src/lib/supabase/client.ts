import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Supabase клиент для использования в клиентских компонентах (Client Components)
 * 
 * Использование:
 * import { supabase } from '@/lib/supabase/client';
 * const { data } = await supabase.from('organizations').select();
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

