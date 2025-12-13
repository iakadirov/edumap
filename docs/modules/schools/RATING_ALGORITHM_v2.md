# Рейтинговая система частных школ — EduMap.uz

## Полный алгоритм расчёта с формулами и обоснованиями

> **Версия**: 2.0
> **Статус**: Production Ready
> **Принцип**: 100% прозрачность, 0% возможности купить рейтинг

---

# Часть 1: Философия и принципы

## 1.1 Почему рейтинг важен?

```
Проблема рынка образования Узбекистана:
├── Информационная асимметрия (школа знает о себе всё, родитель — почти ничего)
├── Маркетинг ≠ Качество (красивый Instagram не гарантирует образование)
├── Сарафанное радио субъективно (опыт одной семьи ≠ опыт всех)
└── Цена ≠ Качество (дорого не значит хорошо)

Решение:
Объективная, прозрачная, непокупаемая система оценки
```

## 1.2 Ключевые принципы

| Принцип | Описание | Как обеспечиваем |
|---------|----------|------------------|
| **Прозрачность** | Любой может понять и пересчитать | Публикуем все формулы |
| **Объективность** | Минимум субъективных оценок | 70% — измеримые данные |
| **Верифицируемость** | Данные можно проверить | Требуем документы |
| **Независимость** | Деньги не влияют на рейтинг | Разделение коммерции и рейтинга |
| **Актуальность** | Данные свежие | Ежегодное обновление + мониторинг |
| **Справедливость** | Сравниваем сопоставимое | Нормализация по категориям |

## 1.3 Что рейтинг измеряет?

```
КАЧЕСТВО ШКОЛЫ = f(
    Условия обучения,        // Что школа предоставляет
    Процесс обучения,        // Как учат
    Результаты обучения,     // Чего достигают
    Удовлетворённость        // Как оценивают участники
)
```

---

# Часть 2: Структура рейтинга

## 2.1 Общая формула

```
РЕЙТИНГ = Σ(Категория × Вес)

где:
├── A. Академическое качество     × 0.30 (30%)
├── B. Педагогический состав      × 0.20 (20%)
├── C. Инфраструктура и ресурсы   × 0.15 (15%)
├── D. Результаты и достижения    × 0.20 (20%)
├── E. Отзывы и удовлетворённость × 0.10 (10%)
└── F. Институциональные факторы  × 0.05 (5%)
                                   ─────────
                            ИТОГО: 1.00 (100%)
```

## 2.2 Визуализация весов

```
┌─────────────────────────────────────────────────────────────────────┐
│                        СТРУКТУРА РЕЙТИНГА                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  A. Академическое качество (30%)                                    │
│  ████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                      │
│  B. Педагогический состав (20%)                                     │
│  ██████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                      │
│  C. Инфраструктура (15%)                                            │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                      │
│  D. Результаты (20%)                                                │
│  ██████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                      │
│  E. Отзывы (10%)                                                    │
│  █████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                      │
│  F. Институциональные (5%)                                          │
│  ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

# Часть 3: Детализация категорий

## A. АКАДЕМИЧЕСКОЕ КАЧЕСТВО (30 баллов)

### A1. Учебная программа (10 баллов)

#### A1.1 Тип и аккредитация программы (5 баллов)

| Программа | Баллы | Обоснование |
|-----------|-------|-------------|
| Международная с аккредитацией (IB, Cambridge IGCSE/A-Level) | 5.0 | Глобально признанный стандарт, строгий контроль качества |
| Международная без аккредитации (по методике) | 3.5 | Хорошая методика, но нет внешнего контроля |
| Смешанная (национальная + международная) | 4.0 | Баланс локального и глобального |
| Усиленная национальная | 3.0 | Углублённое изучение предметов |
| Базовая национальная | 2.0 | Минимальный стандарт |

```python
def calc_curriculum_score(school):
    base_score = CURRICULUM_SCORES[school.curriculum_type]
    
    # Бонусы за дополнительные аккредитации
    bonus = 0
    if school.has_cambridge_accreditation:
        bonus += 0.3
    if school.has_pearson_accreditation:
        bonus += 0.2
    if school.has_college_board_partnership:  # SAT/AP
        bonus += 0.2
    
    return min(base_score + bonus, 5.0)  # Максимум 5
```

**Почему это важно:**
- Аккредитованные программы проходят внешний аудит
- Стандартизированные требования к качеству
- Признание аттестата за рубежом

#### A1.2 Глубина и широта программы (3 балла)

| Критерий | Макс. балл | Как измеряем |
|----------|------------|--------------|
| Количество предметов на выбор в старших классах | 1.0 | < 5: 0.3 / 5-10: 0.6 / 10-15: 0.8 / >15: 1.0 |
| Наличие углублённых курсов (Advanced/Honors) | 1.0 | Нет: 0 / 1-3 предмета: 0.5 / 4+: 1.0 |
| STEM-программа | 0.5 | Нет: 0 / Базовая: 0.3 / Развитая: 0.5 |
| Гуманитарные и творческие направления | 0.5 | Нет: 0 / Базовые: 0.3 / Развитые: 0.5 |

```python
def calc_program_depth(school):
    # Предметы на выбор
    electives = school.elective_subjects_count
    electives_score = (
        0.3 if electives < 5 else
        0.6 if electives < 10 else
        0.8 if electives < 15 else
        1.0
    )
    
    # Углублённые курсы
    advanced = school.advanced_courses_count
    advanced_score = 0 if advanced == 0 else (0.5 if advanced < 4 else 1.0)
    
    # STEM
    stem_score = (
        0 if not school.has_stem else
        0.3 if school.stem_level == 'basic' else
        0.5
    )
    
    # Гуманитарные
    humanities_score = (
        0 if not school.has_humanities_arts else
        0.3 if school.humanities_level == 'basic' else
        0.5
    )
    
    return electives_score + advanced_score + stem_score + humanities_score
```

#### A1.3 Языковая программа (2 балла)

| Критерий | Баллы | Условие |
|----------|-------|---------|
| Билингвальное обучение | 0.8 | Два языка обучения (не изучения) |
| Качество преподавания английского | 0.6 | Native speakers / Сертифицированные преподаватели |
| Дополнительные иностранные языки | 0.3 | Каждый язык: +0.1 (макс 0.3) |
| Подготовка к языковым экзаменам | 0.3 | IELTS/TOEFL/Cambridge в программе |

```python
def calc_language_score(school):
    score = 0
    
    # Билингвальность
    if school.is_bilingual:
        score += 0.8
    
    # Качество английского
    if school.has_native_english_teachers or school.english_teachers_certified_percent > 80:
        score += 0.6
    elif school.english_teachers_certified_percent > 50:
        score += 0.3
    
    # Доп. языки (китайский, корейский, немецкий, французский, арабский)
    extra_languages = len(school.foreign_languages) - 1  # Минус английский
    score += min(extra_languages * 0.1, 0.3)
    
    # Подготовка к экзаменам
    if school.offers_ielts_prep or school.offers_toefl_prep:
        score += 0.3
    
    return min(score, 2.0)
```

---

### A2. Учебный процесс (10 баллов)

#### A2.1 Размер классов (3 балла)

**Научное обоснование:** Исследования показывают, что размер класса напрямую влияет на индивидуальное внимание и результаты (STAR Project, Tennessee).

| Средний размер класса | Баллы | Обоснование |
|-----------------------|-------|-------------|
| ≤ 12 учеников | 3.0 | Индивидуальный подход, максимальное внимание |
| 13-16 учеников | 2.5 | Отличные условия для обучения |
| 17-20 учеников | 2.0 | Хороший стандарт |
| 21-25 учеников | 1.5 | Приемлемо |
| 26-30 учеников | 1.0 | Затруднённое внимание |
| > 30 учеников | 0.5 | Массовое обучение |

```python
def calc_class_size_score(avg_class_size):
    if avg_class_size <= 12:
        return 3.0
    elif avg_class_size <= 16:
        return 2.5
    elif avg_class_size <= 20:
        return 2.0
    elif avg_class_size <= 25:
        return 1.5
    elif avg_class_size <= 30:
        return 1.0
    else:
        return 0.5
```

#### A2.2 Соотношение ученик/учитель (2 балла)

| Соотношение | Баллы | 
|-------------|-------|
| ≤ 8:1 | 2.0 |
| 9:1 - 10:1 | 1.7 |
| 11:1 - 12:1 | 1.4 |
| 13:1 - 15:1 | 1.0 |
| 16:1 - 20:1 | 0.6 |
| > 20:1 | 0.3 |

```python
def calc_student_teacher_ratio_score(total_students, total_teachers):
    ratio = total_students / total_teachers
    
    if ratio <= 8:
        return 2.0
    elif ratio <= 10:
        return 1.7
    elif ratio <= 12:
        return 1.4
    elif ratio <= 15:
        return 1.0
    elif ratio <= 20:
        return 0.6
    else:
        return 0.3
```

#### A2.3 Методология преподавания (3 балла)

| Критерий | Макс. балл | Как оцениваем |
|----------|------------|---------------|
| Современные методики (Project-based, Inquiry-based) | 1.0 | Документация + отзывы |
| Дифференцированное обучение | 0.5 | Наличие разноуровневых групп |
| Использование технологий в обучении | 0.5 | EdTech интеграция |
| Формативное оценивание | 0.5 | Система обратной связи |
| Развитие soft skills | 0.5 | Программы критического мышления, коммуникации |

```python
def calc_methodology_score(school):
    score = 0
    
    # Современные методики
    modern_methods = ['project_based', 'inquiry_based', 'flipped_classroom', 'collaborative']
    methods_count = sum(1 for m in modern_methods if m in school.teaching_methods)
    score += min(methods_count * 0.25, 1.0)
    
    # Дифференциация
    if school.has_differentiated_learning:
        score += 0.5
    
    # EdTech
    if school.has_lms and school.has_digital_resources:
        score += 0.5
    elif school.has_lms or school.has_digital_resources:
        score += 0.25
    
    # Формативное оценивание
    if school.has_formative_assessment_system:
        score += 0.5
    
    # Soft skills
    if school.has_soft_skills_program:
        score += 0.5
    
    return min(score, 3.0)
```

#### A2.4 Внеклассная деятельность (2 балла)

| Критерий | Макс. балл |
|----------|------------|
| Количество кружков и секций | 0.6 |
| Разнообразие направлений | 0.6 |
| Участие учеников | 0.4 |
| Достижения во внеклассной деятельности | 0.4 |

```python
def calc_extracurricular_score(school):
    # Количество (макс 0.6)
    clubs_count = len(school.clubs) + len(school.sports_sections) + len(school.arts_programs)
    quantity_score = min(clubs_count / 20, 1.0) * 0.6
    
    # Разнообразие — должны быть все категории (макс 0.6)
    categories = 0
    if school.has_sports_programs: categories += 1
    if school.has_arts_programs: categories += 1
    if school.has_academic_clubs: categories += 1
    if school.has_tech_clubs: categories += 1
    if school.has_social_clubs: categories += 1
    diversity_score = (categories / 5) * 0.6
    
    # Участие учеников (макс 0.4)
    participation_rate = school.extracurricular_participation_percent or 50
    participation_score = min(participation_rate / 100, 1.0) * 0.4
    
    # Достижения (макс 0.4)
    achievements_score = min(school.extracurricular_awards_count / 10, 1.0) * 0.4
    
    return quantity_score + diversity_score + participation_score + achievements_score
```

---

### A3. Оценка и мониторинг (10 баллов)

#### A3.1 Система оценивания (3 балла)

| Критерий | Баллы |
|----------|-------|
| Прозрачная система оценивания с чёткими критериями | 1.0 |
| Регулярная обратная связь родителям | 1.0 |
| Онлайн-доступ к оценкам и прогрессу | 0.5 |
| Портфолио ученика | 0.5 |

#### A3.2 Диагностика и поддержка (4 балла)

| Критерий | Баллы | Обоснование |
|----------|-------|-------------|
| Входная диагностика при поступлении | 0.5 | Понимание начального уровня |
| Регулярное тестирование прогресса | 1.0 | Мониторинг развития |
| Программа поддержки отстающих | 1.0 | Работа со сложностями |
| Программа для одарённых | 1.0 | Развитие талантов |
| Психологическое сопровождение | 0.5 | Эмоциональное благополучие |

```python
def calc_support_score(school):
    score = 0
    
    if school.has_entry_diagnostics:
        score += 0.5
    if school.has_regular_progress_testing:
        score += 1.0
    if school.has_remedial_program:
        score += 1.0
    if school.has_gifted_program:
        score += 1.0
    if school.has_psychologist:
        score += 0.5
    
    return score
```

#### A3.3 Подготовка к экзаменам (3 балла)

| Экзамен | Баллы | Условие |
|---------|-------|---------|
| DTM (национальный) | 1.0 | Специальная подготовка в программе |
| IELTS/TOEFL | 1.0 | Курсы + результаты выпускников |
| SAT/ACT | 0.5 | Наличие подготовки |
| Международные экзамены (Cambridge, IB) | 0.5 | Регистрация как центр |

---

## B. ПЕДАГОГИЧЕСКИЙ СОСТАВ (20 баллов)

### B1. Квалификация учителей (8 баллов)

#### B1.1 Образование (3 балла)

| Уровень | % учителей | Баллы |
|---------|------------|-------|
| PhD / Кандидаты наук | > 10% | +0.5 |
| Магистратура | > 40% | +1.0 |
| Высшее педагогическое | > 90% | +1.0 |
| Профильное высшее | > 95% | +0.5 |

```python
def calc_teacher_education_score(school):
    score = 0
    
    if school.teachers_with_phd_percent > 10:
        score += 0.5
    elif school.teachers_with_phd_percent > 5:
        score += 0.3
    
    if school.teachers_with_masters_percent > 40:
        score += 1.0
    elif school.teachers_with_masters_percent > 25:
        score += 0.6
    elif school.teachers_with_masters_percent > 15:
        score += 0.3
    
    if school.teachers_with_higher_education_percent > 90:
        score += 1.0
    elif school.teachers_with_higher_education_percent > 80:
        score += 0.7
    
    if school.teachers_with_relevant_degree_percent > 95:
        score += 0.5
    elif school.teachers_with_relevant_degree_percent > 85:
        score += 0.3
    
    return min(score, 3.0)
```

#### B1.2 Сертификации (2 балла)

| Сертификация | Баллы |
|--------------|-------|
| Международные педагогические (PGCE, QTS) | +0.4 |
| Cambridge / IB сертификация | +0.4 |
| CELTA / DELTA (для учителей английского) | +0.3 |
| Национальные категории (высшая, первая) | +0.3 |
| Методические публикации | +0.2 |
| Регулярное повышение квалификации | +0.4 |

```python
def calc_teacher_certification_score(school):
    score = 0
    
    if school.teachers_with_international_cert_percent > 20:
        score += 0.4
    elif school.teachers_with_international_cert_percent > 10:
        score += 0.2
    
    if school.teachers_with_cambridge_ib_cert_percent > 30:
        score += 0.4
    elif school.teachers_with_cambridge_ib_cert_percent > 15:
        score += 0.2
    
    if school.english_teachers_with_celta_percent > 50:
        score += 0.3
    
    if school.teachers_with_highest_category_percent > 30:
        score += 0.3
    elif school.teachers_with_highest_category_percent > 15:
        score += 0.15
    
    if school.has_regular_pd_program:
        score += 0.4
    
    return min(score, 2.0)
```

#### B1.3 Опыт (2 балла)

| Средний стаж | Баллы |
|--------------|-------|
| > 15 лет | 2.0 |
| 10-15 лет | 1.6 |
| 7-10 лет | 1.2 |
| 5-7 лет | 0.8 |
| 3-5 лет | 0.5 |
| < 3 лет | 0.3 |

**Корректировка:** Баланс опытных и молодых

```python
def calc_teacher_experience_score(school):
    avg_exp = school.avg_teacher_experience_years
    
    base_score = (
        2.0 if avg_exp > 15 else
        1.6 if avg_exp > 10 else
        1.2 if avg_exp > 7 else
        0.8 if avg_exp > 5 else
        0.5 if avg_exp > 3 else
        0.3
    )
    
    # Бонус за баланс: есть и опытные (>10 лет) и молодые (<5 лет)
    if school.teachers_with_10plus_years_percent > 30 and school.teachers_with_under_5_years_percent > 20:
        base_score += 0.2
    
    return min(base_score, 2.0)
```

#### B1.4 Международный состав (1 балл)

| Критерий | Баллы |
|----------|-------|
| Native English speakers | +0.4 |
| Учителя из-за рубежа с опытом | +0.3 |
| Учителя с международным опытом работы | +0.3 |

---

### B2. Стабильность и развитие коллектива (6 баллов)

#### B2.1 Текучка кадров (3 балла)

**Почему важно:** Высокая текучка = потеря институциональных знаний, стресс для учеников, нестабильность.

| Текучка в год | Баллы | Интерпретация |
|---------------|-------|---------------|
| < 5% | 3.0 | Отличная стабильность |
| 5-10% | 2.5 | Хорошая стабильность |
| 10-15% | 2.0 | Норма для рынка |
| 15-20% | 1.5 | Повышенная |
| 20-30% | 1.0 | Высокая — тревожный сигнал |
| > 30% | 0.5 | Критическая |

```python
def calc_teacher_turnover_score(school):
    turnover = school.teacher_turnover_rate_percent
    
    if turnover < 5:
        return 3.0
    elif turnover < 10:
        return 2.5
    elif turnover < 15:
        return 2.0
    elif turnover < 20:
        return 1.5
    elif turnover < 30:
        return 1.0
    else:
        return 0.5
```

#### B2.2 Профессиональное развитие (2 балла)

| Критерий | Баллы |
|----------|-------|
| Бюджет на PD > 3% от ФОТ | +0.5 |
| Регулярные внутренние тренинги | +0.3 |
| Участие в конференциях | +0.3 |
| Менторство для новых учителей | +0.3 |
| Обмен опытом с другими школами | +0.3 |
| Публикации и методические разработки | +0.3 |

#### B2.3 Удовлетворённость учителей (1 балл)

*Опционально — если есть данные опросов*

| NPS учителей | Баллы |
|--------------|-------|
| > 50 | 1.0 |
| 30-50 | 0.7 |
| 10-30 | 0.4 |
| < 10 | 0.2 |

---

### B3. Руководство школы (6 баллов)

#### B3.1 Квалификация директора (2 балла)

| Критерий | Баллы |
|----------|-------|
| Педагогическое образование | +0.3 |
| Управленческое образование (MBA, EdM) | +0.4 |
| Опыт руководства > 5 лет | +0.4 |
| Опыт в образовании > 10 лет | +0.3 |
| Международный опыт | +0.3 |
| Признание в профессиональном сообществе | +0.3 |

#### B3.2 Управленческая команда (2 балла)

| Критерий | Баллы |
|----------|-------|
| Наличие завучей по направлениям | +0.5 |
| Квалифицированный HR | +0.3 |
| Финансовый директор | +0.2 |
| Координаторы программ | +0.5 |
| Чёткая орг. структура | +0.5 |

#### B3.3 Стратегическое развитие (2 балла)

| Критерий | Баллы |
|----------|-------|
| Наличие стратегического плана | +0.5 |
| Публичная миссия и ценности | +0.3 |
| Регулярная самооценка | +0.4 |
| План развития инфраструктуры | +0.4 |
| Инновационные инициативы | +0.4 |

---

## C. ИНФРАСТРУКТУРА И РЕСУРСЫ (15 баллов)

### C1. Учебные помещения (5 баллов)

#### C1.1 Классные комнаты (2 балла)

| Критерий | Баллы |
|----------|-------|
| Площадь > 2.5 м² на ученика | +0.5 |
| Естественное освещение | +0.3 |
| Климат-контроль | +0.3 |
| Современная мебель (регулируемая) | +0.3 |
| Интерактивные доски во всех классах | +0.3 |
| Проекторы/дисплеи | +0.3 |

#### C1.2 Специализированные помещения (3 балла)

| Помещение | Баллы | Детали |
|-----------|-------|--------|
| Научные лаборатории | 0.8 | +0.2 за каждую (физика, химия, биология) |
| Компьютерный класс | 0.4 | Современное оборудование |
| Библиотека | 0.4 | > 5 книг на ученика |
| Актовый зал | 0.3 | Вместимость, оборудование |
| Музыкальный класс | 0.2 | Инструменты |
| Художественная студия | 0.2 | Оборудование |
| Мастерские (технология) | 0.2 | Станки, инструменты |
| Зал робототехники / STEM lab | 0.3 | Современное оборудование |
| Медиа-студия | 0.2 | Для создания контента |

```python
def calc_specialized_rooms_score(school):
    score = 0
    
    # Лаборатории (макс 0.8)
    labs = ['physics_lab', 'chemistry_lab', 'biology_lab', 'general_science_lab']
    lab_count = sum(1 for lab in labs if getattr(school, f'has_{lab}', False))
    score += min(lab_count * 0.2, 0.8)
    
    # Остальные помещения
    rooms = {
        'computer_lab': 0.4,
        'library': 0.4,
        'auditorium': 0.3,
        'music_room': 0.2,
        'art_studio': 0.2,
        'workshop': 0.2,
        'stem_lab': 0.3,
        'media_studio': 0.2
    }
    
    for room, points in rooms.items():
        if getattr(school, f'has_{room}', False):
            score += points
    
    return min(score, 3.0)
```

---

### C2. Спортивная инфраструктура (3 балла)

| Объект | Баллы |
|--------|-------|
| Спортзал (соответствует нормам) | 0.6 |
| Открытая спортивная площадка | 0.4 |
| Футбольное поле | 0.3 |
| Баскетбольная площадка | 0.2 |
| Бассейн | 0.5 |
| Теннисные корты | 0.2 |
| Тренажёрный зал | 0.2 |
| Беговые дорожки / стадион | 0.3 |
| Раздевалки и душевые | 0.3 |

```python
def calc_sports_infrastructure_score(school):
    facilities = {
        'gym': 0.6,
        'outdoor_sports_ground': 0.4,
        'football_field': 0.3,
        'basketball_court': 0.2,
        'swimming_pool': 0.5,
        'tennis_court': 0.2,
        'fitness_room': 0.2,
        'running_track': 0.3,
        'locker_rooms': 0.3
    }
    
    score = sum(
        points for facility, points in facilities.items()
        if getattr(school, f'has_{facility}', False)
    )
    
    return min(score, 3.0)
```

---

### C3. IT-инфраструктура (3 балла)

| Критерий | Баллы |
|----------|-------|
| Высокоскоростной Wi-Fi везде | 0.4 |
| 1:1 устройства (планшеты/ноутбуки) | 0.5 |
| LMS (Google Classroom, Canvas и т.д.) | 0.4 |
| Родительский портал | 0.3 |
| Электронный журнал | 0.3 |
| Современные компьютеры (< 5 лет) | 0.3 |
| Лицензионное ПО | 0.2 |
| IT-поддержка на месте | 0.3 |
| Кибербезопасность (фильтры, защита) | 0.3 |

---

### C4. Безопасность и здоровье (2.5 балла)

| Критерий | Баллы |
|----------|-------|
| Профессиональная охрана 24/7 | 0.3 |
| Система видеонаблюдения | 0.3 |
| Контроль доступа (пропуска, турникеты) | 0.3 |
| Огороженная территория | 0.2 |
| Медицинский кабинет | 0.3 |
| Штатная медсестра | 0.3 |
| Пожарная безопасность (сигнализация, учения) | 0.3 |
| План эвакуации | 0.2 |
| Соответствие санитарным нормам | 0.3 |

---

### C5. Питание и комфорт (1.5 балла)

| Критерий | Баллы |
|----------|-------|
| Своя кухня (не кейтеринг) | 0.3 |
| Разнообразное меню | 0.2 |
| Учёт диетических требований | 0.2 |
| Чистая и современная столовая | 0.2 |
| Питьевая вода (кулеры/фонтанчики) | 0.1 |
| Зоны отдыха для учеников | 0.2 |
| Озеленение территории | 0.2 |
| Детская площадка (для младших) | 0.1 |

---

## D. РЕЗУЛЬТАТЫ И ДОСТИЖЕНИЯ (20 баллов)

### D1. Академические результаты (10 баллов)

#### D1.1 Результаты выпускников — Поступление (5 баллов)

| Критерий | Макс. балл | Формула |
|----------|------------|---------|
| % поступивших в вузы | 2.0 | (rate / 100) × 2 |
| % поступивших на грант | 1.5 | (grant_rate / 50) × 1.5, max 1.5 |
| % поступивших в топ-вузы УЗ | 0.8 | (top_uz_rate / 40) × 0.8, max 0.8 |
| % поступивших в зарубежные вузы | 0.7 | (abroad_rate / 30) × 0.7, max 0.7 |

**Топ-вузы Узбекистана:** UWED, Westminster Tashkent, ИНХА, ТГЮУ, ТГЭУ, Сингапурский институт

```python
def calc_university_admission_score(school):
    # Базовый % поступления
    admission_rate = school.university_admission_rate_percent or 0
    base_score = (admission_rate / 100) * 2
    
    # Гранты
    grant_rate = school.grant_admission_rate_percent or 0
    grant_score = min((grant_rate / 50) * 1.5, 1.5)
    
    # Топ вузы УЗ
    top_uz_rate = school.top_uzbek_university_rate_percent or 0
    top_uz_score = min((top_uz_rate / 40) * 0.8, 0.8)
    
    # Зарубежные вузы
    abroad_rate = school.foreign_university_rate_percent or 0
    abroad_score = min((abroad_rate / 30) * 0.7, 0.7)
    
    return min(base_score + grant_score + top_uz_score + abroad_score, 5.0)
```

#### D1.2 Результаты экзаменов (3 балла)

| Экзамен | Макс. балл | Как считаем |
|---------|------------|-------------|
| DTM (средний балл) | 1.0 | Нормализация: (score - 120) / 80 × 1.0 |
| IELTS (средний) | 1.0 | (avg_score - 5.0) / 2.5 × 1.0 |
| SAT (средний) | 0.5 | (avg_score - 1000) / 400 × 0.5 |
| Cambridge/IB экзамены | 0.5 | % с высшими оценками |

```python
def calc_exam_results_score(school):
    score = 0
    
    # DTM (шкала ~140-200, хороший результат > 170)
    if school.avg_dtm_score:
        dtm_normalized = max(0, min((school.avg_dtm_score - 120) / 80, 1.0))
        score += dtm_normalized * 1.0
    
    # IELTS (шкала 1-9, хороший > 6.5)
    if school.avg_ielts_score:
        ielts_normalized = max(0, min((school.avg_ielts_score - 5.0) / 2.5, 1.0))
        score += ielts_normalized * 1.0
    
    # SAT (шкала 400-1600, хороший > 1200)
    if school.avg_sat_score:
        sat_normalized = max(0, min((school.avg_sat_score - 1000) / 400, 1.0))
        score += sat_normalized * 0.5
    
    # Cambridge/IB
    if school.cambridge_high_grades_percent:
        score += min(school.cambridge_high_grades_percent / 100, 1.0) * 0.5
    
    return min(score, 3.0)
```

#### D1.3 Прогресс учеников (2 балла)

*Value-added метрика — насколько школа улучшает результаты относительно входного уровня*

| Критерий | Баллы |
|----------|-------|
| Измеряемый прогресс (входная → выходная диагностика) | 1.0 |
| Улучшение по сравнению со средним по региону | 0.5 |
| Retention rate (% остающихся до выпуска) | 0.5 |

```python
def calc_progress_score(school):
    score = 0
    
    # Value-added (если есть данные)
    if school.has_value_added_data and school.value_added_positive:
        score += 1.0
    
    # Retention rate
    retention = school.retention_rate_percent or 80
    if retention > 95:
        score += 0.5
    elif retention > 90:
        score += 0.3
    elif retention > 85:
        score += 0.2
    
    return score
```

---

### D2. Достижения и признание (6 баллов)

#### D2.1 Олимпиады (3 балла)

| Уровень | Баллы за призёра |
|---------|------------------|
| Международные (IMO, IPhO, IOI и др.) | 0.5 |
| Региональные международные (Азия) | 0.3 |
| Республиканские | 0.15 |
| Городские | 0.05 |

```python
def calc_olympiad_score(school):
    score = 0
    
    # За последние 3 года
    score += school.international_olympiad_medals * 0.5
    score += school.regional_international_medals * 0.3
    score += school.national_olympiad_medals * 0.15
    score += school.city_olympiad_medals * 0.05
    
    # Нормализация — сравнение с размером школы
    medals_per_100_students = score / (school.total_students / 100)
    
    return min(medals_per_100_students, 3.0)
```

#### D2.2 Конкурсы и соревнования (2 балла)

| Категория | Макс. балл |
|-----------|------------|
| Научные конкурсы | 0.5 |
| Творческие конкурсы | 0.4 |
| Спортивные достижения | 0.4 |
| Дебаты, Model UN | 0.3 |
| Технические конкурсы (робототехника, хакатоны) | 0.4 |

#### D2.3 Признание школы (1 балл)

| Критерий | Баллы |
|----------|-------|
| Международные награды школе | 0.3 |
| Национальные награды | 0.2 |
| Рейтинги и аккредитации | 0.3 |
| Членство в ассоциациях (CIS, ECIS) | 0.2 |

---

### D3. Развитие выпускников (4 балла)

#### D3.1 Карьерные траектории (2 балла)

*Отложенный показатель — оцениваем через 5-10 лет*

| Критерий | Баллы |
|----------|-------|
| % выпускников с высшим образованием | 0.5 |
| % работающих по специальности | 0.3 |
| Успешные выпускники (публичное признание) | 0.4 |
| Выпускники в топ-компаниях/вузах мира | 0.4 |
| Alumni network (активное сообщество) | 0.4 |

#### D3.2 Связь со школой (2 балла)

| Критерий | Баллы |
|----------|-------|
| Активный Alumni клуб | 0.5 |
| Выпускники возвращаются преподавать | 0.3 |
| Менторские программы | 0.4 |
| Выпускники приводят своих детей | 0.4 |
| Поддержка школы выпускниками | 0.4 |

---

## E. ОТЗЫВЫ И УДОВЛЕТВОРЁННОСТЬ (10 баллов)

### E1. Отзывы родителей (6 баллов)

#### E1.1 Общий рейтинг (3 балла)

**Только верифицированные отзывы!**

```python
def calc_parent_review_score(school):
    if school.verified_reviews_count < 10:
        return None  # "Недостаточно данных"
    
    avg_rating = school.avg_verified_rating  # 1-5 шкала
    
    # Конвертация в баллы
    # 5.0 → 3.0
    # 4.5 → 2.5
    # 4.0 → 2.0
    # 3.5 → 1.5
    # 3.0 → 1.0
    # < 3.0 → 0.5
    
    score = max(0.5, (avg_rating - 2.5) * 1.2)
    return min(score, 3.0)
```

#### E1.2 Детальные оценки (2 балла)

Родители оценивают по критериям (каждый 1-5):

| Критерий | Вес |
|----------|-----|
| Качество преподавания | 0.25 |
| Безопасность | 0.15 |
| Инфраструктура | 0.15 |
| Коммуникация школы с родителями | 0.15 |
| Атмосфера и культура | 0.15 |
| Соотношение цена/качество | 0.15 |

```python
def calc_detailed_review_score(school):
    weights = {
        'teaching_quality': 0.25,
        'safety': 0.15,
        'infrastructure': 0.15,
        'communication': 0.15,
        'atmosphere': 0.15,
        'value_for_money': 0.15
    }
    
    weighted_avg = sum(
        school.avg_rating_by_criterion.get(criterion, 3) * weight
        for criterion, weight in weights.items()
    )
    
    # Конвертация 1-5 в 0-2
    return (weighted_avg - 1) / 2
```

#### E1.3 NPS родителей (1 балл)

**Вопрос:** "Порекомендовали бы вы эту школу другим родителям?"

| NPS | Баллы |
|-----|-------|
| > 70 | 1.0 |
| 50-70 | 0.8 |
| 30-50 | 0.6 |
| 10-30 | 0.4 |
| 0-10 | 0.2 |
| < 0 | 0.1 |

---

### E2. Отзывы учеников (2 балла)

*Для старших классов (9-11)*

| Критерий | Баллы |
|----------|-------|
| Общая удовлетворённость | 0.5 |
| Качество преподавания | 0.5 |
| Школьная жизнь и атмосфера | 0.5 |
| Подготовка к будущему | 0.5 |

---

### E3. Косвенные индикаторы (2 балла)

| Критерий | Баллы | Обоснование |
|----------|-------|-------------|
| Конкурс при поступлении | 0.5 | Высокий спрос = признание качества |
| % повторных записей (второй ребёнок) | 0.5 | Лучший показатель доверия |
| Длина waitlist | 0.3 | Превышение спроса |
| Рост числа учеников за 3 года | 0.4 | Устойчивый рост |
| Упоминания в СМИ (позитивные) | 0.3 | Репутация |

```python
def calc_indirect_satisfaction_score(school):
    score = 0
    
    # Конкурс (заявок на место)
    competition = school.applications_per_spot or 1
    if competition > 5:
        score += 0.5
    elif competition > 3:
        score += 0.3
    elif competition > 2:
        score += 0.2
    
    # Повторные записи
    repeat_rate = school.sibling_enrollment_rate_percent or 0
    score += min(repeat_rate / 100, 0.5)
    
    # Рост
    growth = school.student_growth_3_years_percent or 0
    if growth > 20:
        score += 0.4
    elif growth > 10:
        score += 0.2
    elif growth > 0:
        score += 0.1
    
    return min(score, 2.0)
```

---

## F. ИНСТИТУЦИОНАЛЬНЫЕ ФАКТОРЫ (5 баллов)

### F1. Легальность и соответствие (2 балла)

| Критерий | Баллы |
|----------|-------|
| Действующая лицензия | 0.5 |
| Соответствие образовательным стандартам | 0.3 |
| Аккредитация (государственная) | 0.3 |
| Международные аккредитации | 0.4 |
| Отсутствие нарушений за 3 года | 0.3 |
| Прозрачность документов | 0.2 |

### F2. Финансовая устойчивость (1.5 балла)

| Критерий | Баллы |
|----------|-------|
| Возраст школы > 5 лет | 0.3 |
| Возраст школы > 10 лет | +0.2 |
| Нет задержек зарплат (по отзывам) | 0.3 |
| Инвестиции в развитие | 0.3 |
| Прозрачное ценообразование | 0.2 |
| Финансовая отчётность (если публичная) | 0.2 |

### F3. Социальная ответственность (1.5 балла)

| Критерий | Баллы |
|----------|-------|
| Программа стипендий/скидок | 0.4 |
| Инклюзивность | 0.3 |
| Экологические инициативы | 0.2 |
| Волонтёрские программы | 0.2 |
| Связь с сообществом | 0.2 |
| Прозрачность и открытость | 0.2 |

---

# Часть 4: Итоговый расчёт

## 4.1 Формула агрегации

```python
def calculate_total_rating(school):
    """
    Рассчитывает итоговый рейтинг школы (0-100)
    """
    
    # A. Академическое качество (30%)
    A1 = calc_curriculum_score(school)           # max 10
    A2 = calc_learning_process_score(school)     # max 10
    A3 = calc_assessment_score(school)           # max 10
    A_total = A1 + A2 + A3                       # max 30
    
    # B. Педагогический состав (20%)
    B1 = calc_teacher_qualification_score(school)  # max 8
    B2 = calc_teacher_stability_score(school)      # max 6
    B3 = calc_leadership_score(school)             # max 6
    B_total = B1 + B2 + B3                         # max 20
    
    # C. Инфраструктура (15%)
    C1 = calc_facilities_score(school)             # max 5
    C2 = calc_sports_score(school)                 # max 3
    C3 = calc_it_score(school)                     # max 3
    C4 = calc_safety_score(school)                 # max 2.5
    C5 = calc_comfort_score(school)                # max 1.5
    C_total = C1 + C2 + C3 + C4 + C5               # max 15
    
    # D. Результаты (20%)
    D1 = calc_academic_results_score(school)       # max 10
    D2 = calc_achievements_score(school)           # max 6
    D3 = calc_alumni_score(school)                 # max 4
    D_total = D1 + D2 + D3                         # max 20
    
    # E. Отзывы (10%)
    E1 = calc_parent_reviews_score(school)         # max 6
    E2 = calc_student_reviews_score(school)        # max 2
    E3 = calc_indirect_satisfaction_score(school)  # max 2
    E_total = E1 + E2 + E3                         # max 10
    
    # F. Институциональные (5%)
    F1 = calc_compliance_score(school)             # max 2
    F2 = calc_financial_stability_score(school)    # max 1.5
    F3 = calc_social_responsibility_score(school)  # max 1.5
    F_total = F1 + F2 + F3                         # max 5
    
    # ИТОГО
    total = A_total + B_total + C_total + D_total + E_total + F_total
    
    return round(total, 1)  # 0-100
```

## 4.2 Обработка отсутствующих данных

```python
def handle_missing_data(school, category_score, max_score, data_completeness):
    """
    Корректировка при неполных данных
    
    data_completeness: 0-1 (доля заполненных полей в категории)
    """
    
    if data_completeness < 0.3:
        # Слишком мало данных — не показываем эту категорию
        return None, "Недостаточно данных"
    
    elif data_completeness < 0.7:
        # Частичные данные — показываем с пометкой
        adjusted_score = category_score * data_completeness
        return adjusted_score, "Частичные данные"
    
    else:
        # Достаточно данных
        return category_score, "Полные данные"
```

## 4.3 Нормализация и сравнение

```python
def normalize_rating(raw_score, category_percentiles):
    """
    Нормализация относительно других школ в категории
    
    Позволяет сравнивать школы разных типов справедливо
    """
    
    percentile = calculate_percentile(raw_score, category_percentiles)
    
    # Конвертация в 5-звёздочную систему для отображения
    if percentile >= 90:
        stars = 5
        label = "Превосходно"
    elif percentile >= 75:
        stars = 4
        label = "Отлично"
    elif percentile >= 50:
        stars = 3
        label = "Хорошо"
    elif percentile >= 25:
        stars = 2
        label = "Удовлетворительно"
    else:
        stars = 1
        label = "Ниже среднего"
    
    return {
        'raw_score': raw_score,
        'percentile': percentile,
        'stars': stars,
        'label': label
    }
```

---

# Часть 5: Верификация и качество данных

## 5.1 Источники данных

| Категория | Источник | Верификация |
|-----------|----------|-------------|
| Лицензия, аккредитация | Школа + Мин.образования | Проверка документов |
| Инфраструктура | Школа + Визит | Фото/видео + осмотр |
| Педсостав | Школа | Выборочная проверка дипломов |
| Результаты экзаменов | Школа + Публичные данные | Запрос подтверждения |
| Олимпиады | Публичные списки | Автоматическая сверка |
| Отзывы | Родители | Верификация enrollment |
| Финансы | Школа | Косвенная верификация |

## 5.2 Верификация отзывов

```python
def verify_review(review):
    """
    Многоуровневая верификация отзывов
    """
    
    verification_score = 0
    
    # Уровень 1: Базовая проверка
    if review.user.email_verified:
        verification_score += 1
    if review.user.phone_verified:
        verification_score += 1
    
    # Уровень 2: Подтверждение связи со школой
    if review.has_enrollment_code:  # Код от школы
        verification_score += 3
    elif review.has_payment_proof:   # Квитанция об оплате
        verification_score += 3
    elif review.has_document_proof:  # Договор/справка
        verification_score += 2
    
    # Уровень 3: Поведенческий анализ
    if not is_suspicious_pattern(review):  # ML модель
        verification_score += 1
    
    # Результат
    if verification_score >= 5:
        return "verified", 1.0       # Полностью верифицирован
    elif verification_score >= 3:
        return "partially_verified", 0.7
    else:
        return "unverified", 0.3     # Учитывается с понижающим коэффициентом
```

## 5.3 Детекция манипуляций

```python
def detect_manipulation(school_reviews):
    """
    Выявление подозрительных паттернов
    """
    
    red_flags = []
    
    # Флаг 1: Всплеск позитивных отзывов
    recent_reviews = get_reviews_last_30_days(school_reviews)
    if len(recent_reviews) > 3 * average_monthly_reviews:
        if average_rating(recent_reviews) > 4.5:
            red_flags.append("suspicious_positive_spike")
    
    # Флаг 2: Однотипные отзывы
    if text_similarity_score(recent_reviews) > 0.7:
        red_flags.append("similar_text_pattern")
    
    # Флаг 3: Новые аккаунты
    new_accounts_ratio = count_new_accounts(recent_reviews) / len(recent_reviews)
    if new_accounts_ratio > 0.5:
        red_flags.append("many_new_accounts")
    
    # Флаг 4: Экстремальные оценки без объяснений
    extreme_without_text = count_extreme_ratings_short_text(recent_reviews)
    if extreme_without_text / len(recent_reviews) > 0.3:
        red_flags.append("extreme_ratings_no_detail")
    
    return red_flags
```

---

# Часть 6: Отображение и коммуникация

## 6.1 Карточка рейтинга

```
┌─────────────────────────────────────────────────────────────────┐
│  CAMBRIDGE SCHOOL TASHKENT                                       │
│                                                                  │
│  ████████████████████████████████████████░░░░░░░░░░  78/100     │
│                                                                  │
│  ⭐⭐⭐⭐☆  "Отлично"                                            │
│                                                                  │
│  📚 Академическое:     ████████░░  24/30                        │
│  👨‍🏫 Педагоги:          ███████░░░  15/20                        │
│  🏫 Инфраструктура:    █████████░  12/15                        │
│  🏆 Результаты:        ██████░░░░  14/20                        │
│  💬 Отзывы:            ████████░░   8/10                        │
│  📋 Институц.:         █████████░   5/5                         │
│                                                                  │
│  📊 127 верифицированных отзывов                                │
│  📈 Топ-15% школ Ташкента                                       │
│                                                                  │
│  [Подробная методология →]                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 6.2 Публичная страница методологии

Каждый пользователь может:
- Увидеть все веса и формулы
- Понять как рассчитан каждый балл
- Скачать данные в машиночитаемом формате
- Сообщить о неточности

---

# Часть 7: Governance и независимость

## 7.1 Разделение функций

```
┌─────────────────────────────────────────────────────────────────┐
│                      СТРУКТУРА УПРАВЛЕНИЯ                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  РЕЙТИНГОВЫЙ КОМИТЕТ              КОММЕРЧЕСКИЙ ОТДЕЛ            │
│  (независимый)                    (отдельный)                   │
│                                                                  │
│  • Методология                    • Продажи                     │
│  • Верификация                    • Реклама                     │
│  • Апелляции                      • Подписки                    │
│  • Аудит                          • Партнёрства                 │
│                                                                  │
│           ╳ НЕТ ВЛИЯНИЯ ╳                                       │
│                                                                  │
│  Принцип: Деньги школы НИКОГДА не влияют на рейтинг            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 7.2 Политика конфликта интересов

```markdown
ПУБЛИЧНЫЕ ОБЯЗАТЕЛЬСТВА:

1. Оплата за размещение НЕ влияет на рейтинг
2. Реклама НЕ влияет на рейтинг
3. Любое давление документируется публично
4. Методология открыта для аудита
5. Ежегодный независимый аудит рейтингов
6. Все платежи от школ публикуются (aggregate)
```

## 7.3 Процесс апелляции

```python
def handle_appeal(school, appeal):
    """
    Процесс рассмотрения апелляции школы
    """
    
    # Шаг 1: Проверка формальных требований
    if not appeal.has_evidence:
        return reject("Требуются документальные доказательства")
    
    # Шаг 2: Независимая проверка
    reviewer = assign_independent_reviewer()  # Не знает школу
    review_result = reviewer.verify(appeal.evidence)
    
    # Шаг 3: Решение
    if review_result.evidence_valid:
        update_school_data(school, appeal.corrected_data)
        recalculate_rating(school)
        notify_school("Апелляция принята, рейтинг пересчитан")
    else:
        notify_school("Апелляция отклонена", review_result.reason)
    
    # Шаг 4: Публикация (анонимизированная)
    publish_appeal_decision(appeal, anonymized=True)
```

---

# Часть 8: Обновление и мониторинг

## 8.1 Цикл обновления

| Данные | Частота обновления |
|--------|-------------------|
| Отзывы и рейтинги отзывов | Реальное время |
| Базовые данные школы | По запросу школы + ежеквартально |
| Результаты выпускников | Ежегодно (сентябрь) |
| Олимпиады | Ежегодно (май) |
| Полный пересчёт рейтинга | Ежегодно (август) |
| Аудит методологии | Ежегодно (июль) |

## 8.2 Версионирование

```python
RATING_ALGORITHM_VERSION = "2.0.0"

# Changelog
# v2.0.0 - Полная переработка системы
# v1.5.0 - Добавлена верификация отзывов
# v1.4.0 - Новые критерии инфраструктуры
# v1.3.0 - Учёт DTM результатов
# v1.2.0 - Нормализация по категориям
# v1.1.0 - Добавлены олимпиады
# v1.0.0 - Первая версия
```

---

# Приложения

## Приложение A: Список всех метрик

| ID | Метрика | Категория | Макс. балл | Вес в итоге |
|----|---------|-----------|------------|-------------|
| A1.1 | Тип программы | Академическое | 5.0 | 5% |
| A1.2 | Глубина программы | Академическое | 3.0 | 3% |
| A1.3 | Языковая программа | Академическое | 2.0 | 2% |
| A2.1 | Размер классов | Академическое | 3.0 | 3% |
| A2.2 | Соотношение ученик/учитель | Академическое | 2.0 | 2% |
| A2.3 | Методология | Академическое | 3.0 | 3% |
| A2.4 | Внеклассная деятельность | Академическое | 2.0 | 2% |
| A3.1 | Система оценивания | Академическое | 3.0 | 3% |
| A3.2 | Диагностика и поддержка | Академическое | 4.0 | 4% |
| A3.3 | Подготовка к экзаменам | Академическое | 3.0 | 3% |
| ... | ... | ... | ... | ... |
| **ИТОГО** | | | **100.0** | **100%** |

## Приложение B: Глоссарий

| Термин | Определение |
|--------|-------------|
| **NPS** | Net Promoter Score — индекс готовности рекомендовать |
| **Value-added** | Добавленная ценность — прогресс ученика относительно входного уровня |
| **Retention rate** | Доля учеников, остающихся до выпуска |
| **DTM** | Davlat Test Markazi — государственный тестовый центр |
| **Верификация** | Подтверждение подлинности данных |

---

*Версия 2.0 — Декабрь 2024*
*Следующий плановый пересмотр: Июль 2025*
