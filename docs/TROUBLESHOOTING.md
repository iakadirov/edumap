# Решение проблем — EduMap.uz

## Проблема: "Foydalanuvchi topilmadi yoki faol emas"

### Причины

1. **Пользователь не создан в таблице `users`**
   - Пользователь существует в `auth.users`, но нет записи в `users`
   - Решение: создать запись в таблице `users`

2. **`is_active = false`**
   - Пользователь заблокирован
   - Решение: обновить `is_active = true`

3. **Неверный `auth_user_id`**
   - UUID не совпадает с `auth.users.id`
   - Решение: проверить и исправить UUID

---

## Решение 1: Использовать скрипт (рекомендуется)

```bash
# 1. Получите auth_user_id из Supabase Dashboard → Authentication → Users
# 2. Запустите скрипт:
npx tsx scripts/create-test-admin.ts YOUR_AUTH_USER_ID
```

Скрипт автоматически:
- ✅ Проверит существование пользователя в `auth.users`
- ✅ Создаст или обновит запись в `users`
- ✅ Установит роль `super_admin`
- ✅ Активирует пользователя

---

## Решение 2: Через SQL Editor

### Шаг 1: Проверьте пользователя в auth.users

```sql
-- Найдите ваш email
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'iakadirov@edumap.uz';
```

### Шаг 2: Проверьте существование в users

```sql
-- Проверьте, есть ли запись
SELECT * FROM users 
WHERE email = 'iakadirov@edumap.uz';
```

### Шаг 3: Создайте или обновите запись

**Если записи нет:**
```sql
INSERT INTO users (
  auth_user_id,
  email,
  full_name,
  role,
  subscription_tier,
  is_active,
  email_verified
)
VALUES (
  '5986332a-43fa-4206-a860-e41973f9eca0', -- Замените на ваш auth_user_id
  'iakadirov@edumap.uz',
  'Ibrahim Kadirov',
  'super_admin',
  'premium',
  true,
  true
);
```

**Если запись есть, но is_active = false:**
```sql
UPDATE users
SET 
  is_active = true,
  role = 'super_admin',
  subscription_tier = 'premium'
WHERE email = 'iakadirov@edumap.uz';
```

---

## Решение 3: Проверка через Supabase Dashboard

1. Откройте **Table Editor** → `users`
2. Найдите вашу запись по email
3. Проверьте:
   - ✅ `auth_user_id` совпадает с User UID из Authentication
   - ✅ `is_active = true`
   - ✅ `role = 'super_admin'` (или 'admin', 'moderator')

---

## Быстрая диагностика

Выполните этот запрос для проверки:

```sql
-- Проверка связи auth.users и users
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  u.id as user_id,
  u.email as user_email,
  u.role,
  u.is_active,
  u.subscription_tier
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE au.email = 'iakadirov@edumap.uz';
```

**Ожидаемый результат:**
- `auth_user_id` и `user_id` должны быть заполнены
- `is_active = true`
- `role = 'super_admin'`

---

## После исправления

1. Обновите страницу `/auth/login`
2. Войдите снова
3. Должен произойти редирект на `/admin/dashboard`

---

*Последнее обновление: Декабрь 2025*

