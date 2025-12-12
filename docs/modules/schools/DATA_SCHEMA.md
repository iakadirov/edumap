# Схема данных школы — EduMap.uz

> Полный список всех данных, которые собираем о каждой школе

---

## 📊 Обзор категорий данных

```
ДАННЫЕ ШКОЛЫ
├── 1. Базовая информация
├── 2. Контакты и локация
├── 3. Образовательная программа
├── 4. Структура и размер
├── 5. Педагогический состав
├── 6. Инфраструктура
├── 7. Услуги и сервисы
├── 8. Финансы и оплата
├── 9. Поступление и приём
├── 10. Результаты и достижения
├── 11. Документы и лицензии
├── 12. Медиа контент
├── 13. Социальные сети
└── 14. Мета-информация
```

---

## 1. 🏫 Базовая информация

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `name` | string | ✅ | "Cambridge School Tashkent" |
| `name_uz` | string | ⬜ | "Kembrij maktabi" |
| `name_ru` | string | ⬜ | "Кембриджская школа" |
| `slug` | string | ✅ | "cambridge-school-tashkent" |
| `short_description` | string | ✅ | Краткое описание до 160 символов |
| `full_description` | text | ✅ | Полное описание школы |
| `school_type` | enum | ✅ | `private`, `state`, `international` |
| `founded_year` | number | ⬜ | 2015 |
| `motto` | string | ⬜ | "Excellence in Education" |
| `logo_url` | string | ✅ | URL логотипа |
| `cover_image_url` | string | ⬜ | URL обложки |

---

## 2. 📍 Контакты и локация

### Основные контакты

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `phone_primary` | string | ✅ | "+998 71 123 45 67" |
| `phone_secondary` | string | ⬜ | "+998 90 123 45 67" |
| `phone_admission` | string | ⬜ | Телефон приёмной комиссии |
| `email` | string | ✅ | "info@cambridge.uz" |
| `email_admission` | string | ⬜ | "admission@cambridge.uz" |
| `website` | string | ⬜ | "https://cambridge.uz" |
| `telegram` | string | ⬜ | "@cambridgeschool" |

### Адрес и геолокация

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `address_full` | string | ✅ | "ул. Шота Руставели, 12" |
| `district` | enum | ✅ | "Яккасарайский район" |
| `city` | string | ✅ | "Ташкент" |
| `region` | string | ✅ | "Ташкент" |
| `landmark` | string | ⬜ | "Рядом с метро Космонавтов" |
| `latitude` | decimal | ✅ | 41.311081 |
| `longitude` | decimal | ✅ | 69.279737 |
| `google_maps_url` | string | ⬜ | Ссылка на Google Maps |
| `yandex_maps_url` | string | ⬜ | Ссылка на Яндекс Карты |

### Филиалы (если есть)

| Поле | Тип | Пример |
|------|-----|--------|
| `has_branches` | boolean | true |
| `branches` | array | [{name, address, phone, lat, lng}] |

---

## 3. 📚 Образовательная программа

### Общая информация

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `curriculum_type` | enum | ✅ | `national`, `cambridge`, `ib`, `american`, `mixed` |
| `curriculum_description` | text | ⬜ | Описание программы |
| `education_focus` | array | ⬜ | ["stem", "humanities", "arts", "sports"] |

### Языки обучения

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `primary_language` | enum | ✅ | `uzbek`, `russian`, `english` |
| `secondary_languages` | array | ⬜ | ["english", "russian"] |
| `foreign_languages` | array | ⬜ | ["english", "german", "french", "chinese", "korean", "arabic"] |
| `language_certificates` | array | ⬜ | ["IELTS", "TOEFL", "Cambridge", "DELF"] |

### Классы и ступени

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `grade_from` | number | ✅ | 1 |
| `grade_to` | number | ✅ | 11 |
| `has_preschool` | boolean | ⬜ | true |
| `preschool_age_from` | number | ⬜ | 5 |
| `education_levels` | array | ⬜ | ["primary", "middle", "high"] |

### Специализации и направления

| Поле | Тип | Пример |
|------|-----|--------|
| `specializations` | array | ["математика", "IT", "медицина", "право"] |
| `has_stem_program` | boolean | true |
| `has_arts_program` | boolean | true |
| `has_sports_program` | boolean | true |
| `olympiad_preparation` | array | ["математика", "физика", "информатика"] |
| `exam_preparation` | array | ["SAT", "IELTS", "ЕГЭ", "DTM"] |

### Дополнительное образование

| Поле | Тип | Пример |
|------|-----|--------|
| `extracurricular_activities` | array | Список кружков и секций |
| `clubs` | array | ["робототехника", "шахматы", "дебаты", "театр"] |
| `sports_sections` | array | ["футбол", "плавание", "теннис", "гимнастика"] |
| `arts_programs` | array | ["музыка", "живопись", "танцы"] |

---

## 4. 👥 Структура и размер

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `total_students` | number | ✅ | 850 |
| `total_teachers` | number | ✅ | 65 |
| `student_teacher_ratio` | string | ⬜ | "13:1" |
| `avg_class_size` | number | ✅ | 18 |
| `max_class_size` | number | ⬜ | 22 |
| `total_classes` | number | ⬜ | 45 |
| `classes_per_grade` | object | ⬜ | {"1": 4, "2": 4, ...} |

---

## 5. 👨‍🏫 Педагогический состав

### Общая статистика

| Поле | Тип | Пример |
|------|-----|--------|
| `teachers_total` | number | 65 |
| `teachers_with_higher_education_percent` | number | 95 |
| `teachers_with_pedagogical_degree_percent` | number | 85 |
| `teachers_with_masters_percent` | number | 40 |
| `teachers_with_phd_percent` | number | 5 |
| `native_english_speakers_count` | number | 8 |
| `foreign_teachers_count` | number | 12 |
| `avg_teacher_experience_years` | number | 12 |

### Сертификации учителей

| Поле | Тип | Пример |
|------|-----|--------|
| `teachers_with_international_certs` | number | 25 |
| `teacher_certifications` | array | ["CELTA", "DELTA", "TKT", "TESOL"] |

### Ключевые сотрудники (публичные)

```json
{
  "leadership": [
    {
      "name": "Иванова Мария Петровна",
      "position": "Директор",
      "photo_url": "...",
      "bio": "...",
      "education": "...",
      "experience_years": 25
    }
  ]
}
```

---

## 6. 🏗 Инфраструктура

### Здание и территория

| Поле | Тип | Пример |
|------|-----|--------|
| `building_type` | enum | `purpose_built`, `adapted`, `historic` |
| `building_year` | number | 2018 |
| `total_area_sqm` | number | 5000 |
| `area_per_student_sqm` | number | 6 |
| `floors_count` | number | 3 |
| `outdoor_area_sqm` | number | 2000 |
| `has_playground` | boolean | true |
| `has_garden` | boolean | true |

### Учебные помещения

| Поле | Тип | Пример |
|------|-----|--------|
| `classrooms_count` | number | 45 |
| `has_science_labs` | boolean | true |
| `science_labs_count` | number | 4 |
| `science_labs_types` | array | ["физика", "химия", "биология"] |
| `has_computer_lab` | boolean | true |
| `computer_lab_stations` | number | 30 |
| `has_library` | boolean | true |
| `library_books_count` | number | 10000 |
| `has_media_room` | boolean | true |
| `has_art_studio` | boolean | true |
| `has_music_room` | boolean | true |
| `has_dance_studio` | boolean | false |

### Спортивная инфраструктура

| Поле | Тип | Пример |
|------|-----|--------|
| `has_gym` | boolean | true |
| `gym_area_sqm` | number | 400 |
| `has_swimming_pool` | boolean | true |
| `pool_length_m` | number | 25 |
| `has_football_field` | boolean | true |
| `has_basketball_court` | boolean | true |
| `has_tennis_court` | boolean | false |
| `has_running_track` | boolean | true |
| `sports_facilities` | array | ["gym", "pool", "football", "basketball"] |

### IT и технологии

| Поле | Тип | Пример |
|------|-----|--------|
| `has_smartboards` | boolean | true |
| `smartboards_percent` | number | 100 |
| `has_wifi` | boolean | true |
| `has_1to1_devices` | boolean | true |
| `device_type` | string | "iPad" |
| `has_online_platform` | boolean | true |
| `online_platform_name` | string | "Google Classroom" |
| `has_parent_portal` | boolean | true |

### Безопасность

| Поле | Тип | Пример |
|------|-----|--------|
| `has_security` | boolean | true |
| `security_type` | string | "24/7 охрана" |
| `has_cctv` | boolean | true |
| `has_access_control` | boolean | true |
| `has_fire_safety` | boolean | true |
| `has_emergency_plan` | boolean | true |

### Медицина

| Поле | Тип | Пример |
|------|-----|--------|
| `has_medical_room` | boolean | true |
| `has_nurse` | boolean | true |
| `nurse_schedule` | string | "Ежедневно 8:00-18:00" |
| `has_psychologist` | boolean | true |
| `has_speech_therapist` | boolean | false |

---

## 7. 🍽 Услуги и сервисы

### Питание

| Поле | Тип | Пример |
|------|-----|--------|
| `has_cafeteria` | boolean | true |
| `meal_options` | array | ["breakfast", "lunch", "snacks"] |
| `meals_included_in_fee` | boolean | false |
| `meal_cost_monthly` | number | 500000 |
| `has_halal` | boolean | true |
| `has_vegetarian` | boolean | true |
| `has_special_diet` | boolean | true |
| `own_kitchen` | boolean | true |
| `catering_company` | string | null |

### Транспорт

| Поле | Тип | Пример |
|------|-----|--------|
| `has_transport` | boolean | true |
| `transport_included_in_fee` | boolean | false |
| `transport_cost_monthly` | number | 300000 |
| `transport_routes_count` | number | 8 |
| `transport_coverage_districts` | array | ["Яккасарай", "Мирзо-Улугбек", "Юнусабад"] |
| `buses_count` | number | 5 |
| `has_gps_tracking` | boolean | true |

### Режим и продлёнка

| Поле | Тип | Пример |
|------|-----|--------|
| `school_start_time` | string | "08:30" |
| `school_end_time` | string | "15:00" |
| `has_extended_day` | boolean | true |
| `extended_day_until` | string | "18:00" |
| `extended_day_cost_monthly` | number | 400000 |
| `extended_day_activities` | array | ["homework help", "clubs", "sports"] |
| `has_saturday_classes` | boolean | false |

### Каникулы

| Поле | Тип | Пример |
|------|-----|--------|
| `academic_year_start` | string | "Сентябрь" |
| `academic_year_end` | string | "Июнь" |
| `has_summer_camp` | boolean | true |
| `summer_camp_info` | string | "..." |

---

## 8. 💰 Финансы и оплата

### Стоимость обучения

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `fee_currency` | enum | ✅ | `UZS`, `USD` |
| `fee_period` | enum | ✅ | `monthly`, `yearly`, `semester` |
| `fee_amount_min` | number | ✅ | 3000000 |
| `fee_amount_max` | number | ✅ | 5000000 |
| `fee_by_grade` | object | ⬜ | {"1-4": 3000000, "5-9": 4000000, "10-11": 5000000} |
| `fee_includes` | array | ⬜ | ["tuition", "books", "uniform"] |
| `fee_excludes` | array | ⬜ | ["meals", "transport", "clubs"] |

### Дополнительные расходы

| Поле | Тип | Пример |
|------|-----|--------|
| `admission_fee` | number | 2000000 |
| `annual_registration_fee` | number | 500000 |
| `uniform_cost` | number | 800000 |
| `books_cost_yearly` | number | 300000 |
| `deposit_amount` | number | 0 |

### Скидки и льготы

| Поле | Тип | Пример |
|------|-----|--------|
| `has_scholarships` | boolean | true |
| `scholarship_types` | array | ["academic", "sports", "need-based"] |
| `scholarship_percent_max` | number | 50 |
| `has_sibling_discount` | boolean | true |
| `sibling_discount_percent` | number | 15 |
| `has_early_payment_discount` | boolean | true |
| `early_payment_discount_percent` | number | 5 |

### Оплата

| Поле | Тип | Пример |
|------|-----|--------|
| `payment_methods` | array | ["cash", "card", "transfer", "installments"] |
| `installment_options` | string | "Помесячно, поквартально, за год" |
| `has_refund_policy` | boolean | true |
| `refund_policy_description` | string | "..." |

---

## 9. 📝 Поступление и приём

### Общая информация

| Поле | Тип | Пример |
|------|-----|--------|
| `admission_status` | enum | `open`, `closed`, `waitlist` |
| `admission_period` | string | "Март - Август" |
| `admission_age_min` | number | 6 |
| `admission_grades_open` | array | [1, 5, 8, 10] |

### Требования

| Поле | Тип | Пример |
|------|-----|--------|
| `has_entrance_test` | boolean | true |
| `entrance_test_subjects` | array | ["математика", "русский/узбекский", "english"] |
| `has_interview` | boolean | true |
| `interview_with` | string | "Директор и психолог" |
| `has_trial_day` | boolean | true |
| `trial_day_duration` | string | "1-3 дня" |
| `previous_grades_required` | boolean | true |

### Документы

| Поле | Тип | Пример |
|------|-----|--------|
| `required_documents` | array | ["свидетельство о рождении", "табель", "мед.справка", "фото 3x4"] |
| `documents_description` | text | Подробное описание |

### Процесс

| Поле | Тип | Пример |
|------|-----|--------|
| `admission_steps` | array | ["Заявка", "Тест", "Собеседование", "Договор"] |
| `admission_timeline` | string | "2-4 недели" |
| `online_application` | boolean | true |
| `application_url` | string | "https://..." |

---

## 10. 🏆 Результаты и достижения

### Выпускники

| Поле | Тип | Пример |
|------|-----|--------|
| `first_graduation_year` | number | 2018 |
| `total_graduates` | number | 450 |
| `university_admission_rate` | number | 98 |
| `top_university_rate` | number | 35 |
| `foreign_university_rate` | number | 25 |

### Топ вузы куда поступают

| Поле | Тип | Пример |
|------|-----|--------|
| `top_universities_uzbekistan` | array | ["UWED", "Westminster", "ИНХА"] |
| `top_universities_abroad` | array | ["MIT", "Oxford", "KAIST"] |
| `scholarship_recipients_yearly` | number | 15 |

### Результаты экзаменов

| Поле | Тип | Пример |
|------|-----|--------|
| `avg_sat_score` | number | 1350 |
| `avg_ielts_score` | decimal | 7.0 |
| `avg_national_exam_score` | number | 185 |
| `students_with_ielts_7plus` | number | 45 |

### Олимпиады

| Поле | Тип | Пример |
|------|-----|--------|
| `olympiad_medals_total` | number | 120 |
| `olympiad_medals_by_year` | object | {"2024": 25, "2023": 30} |
| `olympiad_medals_international` | number | 8 |
| `olympiad_medals_national` | number | 45 |
| `olympiad_subjects` | array | ["математика", "физика", "информатика"] |

### Награды школы

| Поле | Тип | Пример |
|------|-----|--------|
| `school_awards` | array | [{year, title, organization}] |
| `accreditations_awards` | array | ["Cambridge International School Award"] |

### Известные выпускники (с разрешения)

| Поле | Тип | Пример |
|------|-----|--------|
| `notable_alumni` | array | [{name, graduation_year, achievement}] |

---

## 11. 📄 Документы и лицензии

| Поле | Тип | Обязательное | Пример |
|------|-----|--------------|--------|
| `license_number` | string | ✅ | "123456" |
| `license_date` | date | ✅ | "2020-01-15" |
| `license_valid_until` | date | ⬜ | "2025-01-15" |
| `license_authority` | string | ✅ | "Министерство образования РУз" |
| `is_accredited` | boolean | ✅ | true |
| `accreditations` | array | ⬜ | ["Cambridge", "IB", "Pearson"] |
| `accreditation_documents` | array | ⬜ | [URLs документов] |

---

## 12. 📸 Медиа контент

### Фотографии

| Поле | Тип | Пример |
|------|-----|--------|
| `photos` | array | [{url, caption, category, is_cover}] |
| `photo_categories` | enum | `exterior`, `classrooms`, `labs`, `sports`, `cafeteria`, `events`, `students` |

### Видео

| Поле | Тип | Пример |
|------|-----|--------|
| `videos` | array | [{url, title, type}] |
| `video_tour_url` | string | YouTube ссылка |
| `promo_video_url` | string | Рекламный ролик |

### Виртуальный тур

| Поле | Тип | Пример |
|------|-----|--------|
| `has_virtual_tour` | boolean | true |
| `virtual_tour_url` | string | Matterport ссылка |

---

## 13. 🌐 Социальные сети

| Поле | Тип | Пример |
|------|-----|--------|
| `instagram` | string | "@cambridgeschool_uz" |
| `facebook` | string | "cambridgeschooluz" |
| `telegram_channel` | string | "@cambridgeschool_news" |
| `youtube` | string | "CambridgeSchoolUz" |
| `linkedin` | string | "..." |
| `tiktok` | string | "@cambridgeschool" |

---

## 14. ⚙️ Мета-информация

### Статус на платформе

| Поле | Тип | Пример |
|------|-----|--------|
| `status` | enum | `pending`, `active`, `suspended`, `archived` |
| `is_verified` | boolean | true |
| `verified_at` | datetime | "2024-01-15" |
| `verification_level` | enum | `basic`, `standard`, `premium` |
| `is_featured` | boolean | false |
| `is_claimed` | boolean | true |
| `claimed_by` | user_id | UUID администратора |

### Рейтинг

| Поле | Тип | Пример |
|------|-----|--------|
| `overall_rating` | decimal | 4.5 |
| `total_reviews` | number | 127 |
| `rating_breakdown` | object | {"5": 80, "4": 30, "3": 10, "2": 5, "1": 2} |

### Timestamps

| Поле | Тип |
|------|-----|
| `created_at` | datetime |
| `updated_at` | datetime |
| `last_verified_at` | datetime |
| `data_updated_by_school_at` | datetime |

### SEO

| Поле | Тип | Пример |
|------|-----|--------|
| `meta_title` | string | "Cambridge School Tashkent - Международная школа" |
| `meta_description` | string | "..." |
| `meta_keywords` | array | ["школа", "ташкент", "cambridge"] |

---

## 📋 Приоритеты данных

### Критически важные (MVP) ✅

```
- name, slug
- school_type
- address, district, city, lat, lng
- phone_primary, email
- grade_from, grade_to
- primary_language
- curriculum_type
- fee_amount_min, fee_amount_max
- total_students, avg_class_size
- logo_url
- license_number
```

### Важные (Phase 2) 🔶

```
- full_description
- foreign_languages
- extracurricular_activities
- infrastructure (основные поля)
- has_transport, has_meals
- admission info
- photos (минимум 5)
```

### Желательные (Phase 3) ⬜

```
- teacher statistics
- results & achievements
- videos, virtual tour
- detailed fee breakdown
- all infrastructure details
```

---

## 🔄 Источники данных

| Источник | Данные | Верификация |
|----------|--------|-------------|
| **Школа** | Всё кроме рейтинга | Проверяем документы |
| **Родители** | Отзывы, рейтинги | Верификация enrollment |
| **Публичные** | Лицензии, результаты олимпиад | Официальные источники |
| **Платформа** | Мета-данные, расчётный рейтинг | Автоматически |

---

*Версия 1.0 — Декабрь 2024*
