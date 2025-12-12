# Настройка первого администратора

## Шаг 1: Создать пользователя в Supabase Auth

1. Откройте Supabase Dashboard
2. Перейдите в **Authentication** → **Users**
3. Нажмите **Add user** → **Create new user**
4. Заполните:
   - **Email**: `iakadirov@edumap.uz` (или ваш email)
   - **Password**: создайте надежный пароль
   - **Auto Confirm User**: ✅ (чтобы не нужно было подтверждать email)
5. Нажмите **Create user**
6. **Скопируйте User UID** (например: `5986332a-43fa-4206-a860-e41973f9eca0`)

---

## Шаг 2: Добавить пользователя в таблицу users

### Вариант 1: Через SQL Editor в Supabase

1. Откройте **SQL Editor** в Supabase Dashboard
2. Выполните запрос (замените `YOUR_AUTH_USER_ID` на UID из шага 1):

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
)
ON CONFLICT (auth_user_id) DO UPDATE
SET
  role = EXCLUDED.role,
  subscription_tier = EXCLUDED.subscription_tier,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified;
```

### Вариант 2: Через Supabase CLI

```bash
# Создать миграцию
npx supabase migration new create_first_admin

# Отредактировать файл миграции и выполнить:
npm run db:push
```

---

## Шаг 3: Проверка

1. Откройте https://edumap-roan.vercel.app/auth/login
2. Войдите с email и паролем из шага 1
3. Должен произойти редирект на `/admin/dashboard`

---

## Ваш запрос был правильным!

✅ Запрос правильный, но можно улучшить:

**Ваш запрос:**
```sql
INSERT INTO users (auth_user_id, email, role, subscription_tier, is_active)
VALUES (
  '5986332a-43fa-4206-a860-e41973f9eca0',
  'iakadirov@edumap.uz',
  'super_admin',
  'premium',
  true
);
```

**Рекомендуемый улучшенный вариант:**
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
  '5986332a-43fa-4206-a860-e41973f9eca0',
  'iakadirov@edumap.uz',
  'Ibrahim Kadirov', -- Добавлено для удобства
  'super_admin',
  'premium',
  true,
  true -- Добавлено для подтверждения email
)
ON CONFLICT (auth_user_id) DO UPDATE
SET
  role = EXCLUDED.role,
  subscription_tier = EXCLUDED.subscription_tier,
  is_active = EXCLUDED.is_active;
```

**Преимущества улучшенного варианта:**
- ✅ `ON CONFLICT` предотвращает ошибку при повторном выполнении
- ✅ `email_verified = true` для подтвержденного email
- ✅ `full_name` для отображения в интерфейсе

---

## Возможные ошибки

### Ошибка: "violates foreign key constraint"
**Причина**: Пользователь с таким `auth_user_id` не существует в `auth.users`  
**Решение**: Сначала создайте пользователя через Authentication → Users

### Ошибка: "duplicate key value violates unique constraint"
**Причина**: Пользователь уже существует  
**Решение**: Используйте `ON CONFLICT ... DO UPDATE` или сначала удалите существующую запись

### Ошибка: "new row violates check constraint"
**Причина**: Неправильное значение для `role` или `subscription_tier`  
**Решение**: Проверьте, что значения соответствуют CHECK constraints

---

*Последнее обновление: Декабрь 2025*

