# Настройка Service Role Key

## Шаг 1: Получить ключ

1. Откройте Supabase Dashboard
2. Перейдите в **Settings** → **API**
3. Найдите секцию **Project API keys**
4. Найдите **service_role** key (НЕ anon key!)
5. Нажмите **Reveal** чтобы показать ключ
6. Скопируйте весь ключ (начинается с `eyJ...`)

---

## Шаг 2: Добавить в .env.local

Откройте файл `.env.local` в корне проекта и добавьте:

```bash
# Supabase Service Role Key (для создания пользователей через Admin API)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...ваш_полный_ключ_здесь
```

**Важно:**
- Ключ должен быть на одной строке (без переносов)
- Не ставьте кавычки вокруг ключа
- Не добавляйте пробелы до или после знака `=`

---

## Шаг 3: Проверить существующие переменные

Убедитесь, что в `.env.local` уже есть:

```bash
# Supabase (обычные ключи)
NEXT_PUBLIC_SUPABASE_URL=https://ваш_проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
```

---

## Шаг 4: Перезапустить dev сервер

После добавления ключа:

1. Остановите текущий dev сервер (Ctrl+C)
2. Запустите заново:
   ```bash
   npm run dev
   ```

---

## Проверка

После перезапуска:

1. Откройте `/admin/users/new`
2. Создайте нового пользователя с паролем
3. Проверьте Supabase Dashboard → Authentication → Users
4. Пользователь должен появиться там ✅

---

## Безопасность

⚠️ **ВАЖНО:**
- Service Role Key обходит ВСЕ RLS политики
- НИКОГДА не коммитьте `.env.local` в Git
- НЕ делитесь ключом публично
- Если ключ утек - сгенерируйте новый в Supabase Dashboard

Файл `.env.local` уже добавлен в `.gitignore`, поэтому он не будет случайно закоммичен.

