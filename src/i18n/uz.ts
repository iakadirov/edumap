/**
 * Узбекские переводы для интерфейса
 * Используются символы: ʻ (U+02BB) для ў и ғ
 */

export const uz = {
  // Общие
  back: '← Katalogga qaytish',
  branch: 'Filial',
  branchOf: 'Tarmoq filiali:',
  foundYear: (year: number) => `${year} yilda tashkil etilgan`,
  
  // Вкладки
  tabs: {
    about: 'Maktab haqida',
    details: 'Tafsilotlar',
    infrastructure: 'Infratuzilma',
    contacts: 'Aloqa',
  },

  // Базовые метрики
  metrics: {
    classes: 'Sinf',
    classesForAdmission: 'Qabul qilinadigan sinflar',
    students: 'Oʻquvchilar',
    teachers: 'Oʻqituvchilar',
    avgClassSize: 'Oʻrtacha sinf hajmi',
    cost: 'Taʼlim narxi',
    perMonth: 'soʻm/oy',
  },

  // Расписание
  schedule: {
    title: 'Jadval',
    classTime: 'Dars vaqti:',
    lessonDuration: 'Dars davomiyligi:',
    minutes: 'daqiqa',
    lessonsPerDay: 'Kuniga darslar:',
    extendedDayUntil: 'Kengaytirilgan kun:',
    saturdayClasses: 'Shanba kunlari darslar:',
    yes: 'Ha',
  },

  // Педагогический состав
  teachers: {
    title: 'Pedagogik tarkib',
    avgExperience: 'Oʻrtacha ish staji:',
    years: 'yil',
    withHigherEducation: 'yuqori maʼlumotli',
    foreignTeachers: 'Chet ellik oʻqituvchilar:',
    nativeEnglishSpeakers: 'Ingliz tili soʻzlashuvchilar:',
  },

  // Языки и программа
  education: {
    languages: 'Taʼlim tillari',
    primary: 'Asosiy:',
    additional: 'Qoʻshimcha:',
    curriculum: 'Taʼlim dasturi',
    extracurricular: 'Qoʻshimcha taʼlim',
    clubs: 'Klublar',
    sportsSections: 'Sport boʻlimlari',
    activities: 'Doʻkonlar va boʻlimlar',
  },

  // Услуги
  services: {
    title: 'Xizmatlar',
    transport: 'Transport',
    meals: 'Ovqatlanish',
    extendedDay: 'Kengaytirilgan kun',
  },

  // Финансы
  finances: {
    title: 'Qoʻshimcha xarajatlar',
    entranceFee: 'Kirish toʻlovi:',
    textbooks: 'Darsliklar (yiliga):',
    uniform: 'Forma:',
    siblingDiscount: 'Ikkinchi farzand uchun chegirma:',
    percent: '%',
  },

  // Инфраструктура
  infrastructure: {
    title: 'Infratuzilma',
    general: 'Umumiy maʼlumot',
    area: 'Maktab maydoni:',
    sqm: 'm²',
    classrooms: 'Sinflar soni:',
    sports: 'Sport infratuzilmasi',
    gym: 'Sport zali',
    pool: 'Suzish havzasi',
    footballField: 'Futbol maydoni',
    facilities: 'Taʼlim xonalari',
    library: 'Kutubxona',
    computerLab: 'Kompyuter xonasi',
    scienceLabs: 'Laboratoriyalar',
    medicalRoom: 'Shifoxona',
    cafeteria: 'Oshxona',
    security: 'Xavfsizlik va qoʻllab-quvvatlash',
    security247: '24/7 qoʻriqchi',
    cctv: 'Video kuzatuv',
    psychologist: 'Psixolog',
  },

  // Документы
  documents: {
    title: 'Hujjatlar va litsenziyalar',
    licenseNumber: 'Litsenziya №:',
    issuedBy: 'Berilgan:',
    issueDate: 'Berilgan sana:',
    validUntil: 'Amal qiladi:',
    accreditation: 'Xalqaro akkreditatsiya:',
  },

  // Контакты
  contacts: {
    title: 'Aloqa maʼlumotlari',
    address: 'Manzil:',
    phone: 'Telefon:',
    secondary: 'Qoʻshimcha:',
    admission: 'Qabul komissiyasi:',
    email: 'Email:',
    website: 'Sayt:',
    telegram: 'Telegram:',
    social: 'Ijtimoiy tarmoqlar:',
    maps: 'Xarita:',
    openOnMap: 'Xaritada ochish',
  },

  // Филиалы
  branches: {
    title: 'Filiallar',
    description: (name: string) => `${name} tarmoqning boshqa filiallari`,
    from: 'dan',
  },

  // Рейтинг
  rating: {
    reviews: (count: number) => `Reyting (${count} sharh)`,
  },

  // Статусы
  internationalAccreditation: 'Xalqaro akkreditatsiya',
} as const;

