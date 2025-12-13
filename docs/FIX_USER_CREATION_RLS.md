# Исправление ошибки RLS при создании пользователей

## Проблема

При создании пользователя через админ-панель возникает ошибка:
```
new row violates row-level security policy for table "users"
```

## Решение

### Вариант 1: Применить миграцию (рекомендуется)

Миграция `017_fix_users_insert_rls.sql` улучшает RLS политику для INSERT в таблицу `users`.

**Как применить:**

1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Выполните содержимое файла `supabase/migrations/017_fix_users_insert_rls.sql`

Или через CLI (если настроен):
```bash
npx supabase db push
```

### Вариант 2: Использовать Service Role Key

Если миграция не может быть применена сразу, код API был обновлен для использования Service Role клиента (если `SUPABASE_SERVICE_ROLE_KEY` установлен), который обходит RLS.

**Как настроить:**

1. Откройте Supabase Dashboard
2. Перейдите в Settings → API
3. Скопируйте **service_role** key (НЕ anon key!)
4. Добавьте в `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key_здесь
   ```
5. Перезапустите dev сервер

**⚠️ ВАЖНО:** Service Role Key обходит ВСЕ RLS политики. Храните его в секретах и НЕ коммитьте в Git!

## Что исправлено

### Миграция 017:

1. **Улучшена функция `get_user_role`**:
   - Добавлена проверка `is_active = true`
   - Более надежная работа с NULL значениями

2. **Обновлена политика INSERT**:
   - Разрешает `super_admin`, `admin` и `moderator` создавать пользователей
   - `super_admin` может создавать всех
   - `admin` может создавать всех кроме `super_admin`
   - `moderator` может создавать только `school_admin` и `user`

3. **Использование EXISTS вместо функции**:
   - Более надежная проверка через EXISTS
   - Избегает проблем с SECURITY DEFINER функциями

## Роли для управления школами

**Да, вы можете создавать администраторов школ!**

Создайте пользователя с ролью `school_admin`:
- `super_admin` и `admin` могут создавать `school_admin`
- `moderator` может создавать `school_admin`
- `school_admin` не может создавать других пользователей

Роль `school_admin` предназначена для управления конкретной школой (организацией).

## Проверка после исправления

1. Примените миграцию или настройте Service Role Key
2. Перезапустите dev сервер (если используется Service Role Key)
3. Попробуйте создать пользователя через `/admin/users/new`
4. Проверьте, что пользователь создался успешно

## Отладка

Если проблема сохраняется:

1. Проверьте, что текущий пользователь имеет роль `super_admin` или `admin`:
   ```sql
   SELECT id, email, role, is_active 
   FROM users 
   WHERE auth_user_id = auth.uid();
   ```

2. Проверьте, применена ли миграция:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'users' 
   AND policyname = 'Admins can insert users';
   ```

3. Проверьте логи в консоли браузера и терминале сервера

