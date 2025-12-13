# Проверка создания пользователей

## Должен ли пользователь появиться в Supabase Auth Users?

**Ответ: ДА, но только при определенных условиях.**

---

## Условия для создания в auth.users

### ✅ Условие 1: Service Role Key установлен

Проверьте `.env.local`:

```bash
# Должна быть эта переменная:
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key
```

**Как получить Service Role Key:**
1. Откройте Supabase Dashboard
2. Перейдите в **Settings** → **API**
3. Скопируйте **service_role** key (НЕ anon key!)
4. Добавьте в `.env.local`
5. Перезапустите dev сервер (`npm run dev`)

### ✅ Условие 2: Пароль указан при создании

При создании пользователя через `/admin/users/new` обязательно укажите пароль.

---

## Как проверить, создался ли пользователь

### Вариант 1: Supabase Dashboard

1. Откройте Supabase Dashboard
2. Перейдите в **Authentication** → **Users**
3. Найдите пользователя по email
4. Если есть → создался в `auth.users` ✅
5. Если нет → создался только в таблице `users` ❌

### Вариант 2: SQL Query

```sql
-- Проверить в auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'ваш_email@example.com';

-- Проверить в users
SELECT id, email, auth_user_id, role 
FROM users 
WHERE email = 'ваш_email@example.com';
```

**Если `auth_user_id` не NULL** → пользователь создан в `auth.users` ✅  
**Если `auth_user_id` NULL** → пользователь НЕ создан в `auth.users` ❌

---

## Что делать, если пользователь не появился в auth.users

### Решение 1: Настроить Service Role Key (рекомендуется)

1. Получите Service Role Key (см. выше)
2. Добавьте в `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=ваш_key_здесь
   ```
3. Перезапустите dev сервер
4. Удалите пользователя из таблицы `users`
5. Создайте заново через админку с паролем

### Решение 2: Создать пользователя вручную

1. Создайте пользователя через админку (без пароля или с паролем, но без Service Role Key)
2. Запишите email и роль
3. Откройте Supabase Dashboard → **Authentication** → **Users**
4. Нажмите **Add user** → создайте пользователя с тем же email и паролем
5. Скопируйте **User UID**
6. Обновите запись в таблице `users`:
   ```sql
   UPDATE users 
   SET auth_user_id = 'скопированный_uid'
   WHERE email = 'ваш_email@example.com';
   ```

---

## Важно

- **Service Role Key обходит все RLS политики** - храните его в секретах!
- **Не коммитьте `.env.local` в Git**
- Если Service Role Key не установлен, пользователь должен будет сам зарегистрироваться
- После создания через админку, пользователь может сразу войти (если создан в auth.users)

