/**
 * Типы для страницы профиля школы
 * Соответствуют дизайн-документации docs/design/school-profile-page.md
 */

export interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
    isVerified: boolean;
  };
  rating: number;
  ratings?: {
    quality: number;
    teachers: number;
    infrastructure: number;
    meals: number;
    communication: number;
  };
  date: string;
  content: string;
  pros?: string[];
  cons?: string[];
  helpfulCount: number;
  schoolResponse?: {
    content: string;
    date: string;
  };
}

export interface SchoolMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  category?: string;
  caption?: string;
  isCover?: boolean;
  sortOrder?: number;
}

export interface SchoolStaff {
  id: string;
  name: string;
  position: string;
  photoUrl?: string;
  experienceYears?: number;
  education?: string;
  certifications?: string[];
  bio?: string;
}

export interface SchoolResult {
  id: string;
  year: number;
  totalGraduates?: number;
  graduatesToUniversities?: number;
  graduatesOnGrants?: number;
  graduatesToTopUzUniversities?: number;
  graduatesToForeignUniversities?: number;
  topUniversitiesUz?: string[];
  foreignUniversities?: string[];
  avgDtmScore?: number;
  avgIeltsScore?: number;
  avgSatScore?: number;
  studentsWithIelts7plus?: number;
  studentsWithIelts8plus?: number;
  olympiadMedalsInternational?: number;
  olympiadMedalsNational?: number;
  olympiadMedalsCity?: number;
  olympiadSubjects?: string[];
  schoolAwards?: Array<{
    year: number;
    title: string;
    organization: string;
  }>;
}

export interface SchoolProfile {
  // Basic
  id: string;
  slug: string;
  name: string;
  nameUz?: string;
  nameRu?: string;
  logo: string;
  coverImage: string;
  description: string;
  shortDescription?: string;
  
  // Type
  type: 'private' | 'international' | 'state_enhanced';
  curriculum: string[];
  accreditations?: string[];
  
  // Location
  location: {
    city: string;
    district: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Education
  grades: {
    from: number;
    to: number;
  };
  languages: string[];
  isBilingual: boolean;
  
  // Rating
  rating: {
    score: number;
    reviewCount: number;
    rank?: number;
    breakdown?: {
      quality: number;
      teachers: number;
      infrastructure: number;
      meals: number;
      communication: number;
    };
  };
  
  // Badges
  badges: {
    isVerified: boolean;
    isPremium?: boolean;
    isNew?: boolean;
    ranking?: {
      type: 'top1' | 'top3' | 'top10' | 'parents_choice';
      year: number;
    };
    awards?: {
      name: string;
      issuer: string;
      year: number;
    }[];
  };
  
  // Pricing
  fee: {
    min: number;
    max?: number;
    currency: 'UZS' | 'USD';
    period: 'month' | 'year';
  };
  
  // Enrollment
  hasOpenEnrollment: boolean;
  enrollmentYear?: string;
  
  // Contacts
  contacts: {
    phones: string[];
    email: string;
    website?: string;
    telegram?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  
  // Stats
  stats: {
    foundedYear?: number;
    studentsCount?: number;
    teachersCount?: number;
    studentTeacherRatio?: string;
    classSize?: {
      min: number;
      max: number;
    };
  };
  
  // Features
  features: string[];
  
  // Media
  photos: SchoolMedia[];
  videos: SchoolMedia[];
  
  // Documents
  documents?: {
    name: string;
    type: 'license' | 'certificate' | 'accreditation';
    issuer: string;
    year: number;
    url: string;
  }[];
  
  // Reviews
  reviews: Review[];
  
  // Program (for Program tab)
  program?: {
    curriculum: string;
    description: string;
    stages?: {
      name: string;
      grades: string;
      description: string;
    }[];
    subjects?: string[];
    extraCurricular?: {
      name: string;
      category: string;
    }[];
    examPrep?: string[];
    languages?: {
      name: string;
      level: string;
    }[];
  };
  
  // Teachers (for Teachers tab)
  teachers?: {
    totalCount: number;
    withHigherEducation?: number;
    withInternationalCerts?: number;
    nativeSpeakers?: number;
    foreignTeachers?: number;
    averageExperience?: number;
    leadership?: SchoolStaff[];
  };
  
  // Infrastructure (for Infrastructure tab)
  infrastructure?: {
    building?: {
      area?: number;
      floors?: number;
      yearBuilt?: number;
      lastRenovation?: number;
    };
    classrooms?: {
      total?: number;
      withAC?: boolean;
      withSmartBoard?: boolean;
    };
    facilities?: string[];
    sports?: string[];
    security?: string[];
    it?: {
      hasWifi?: boolean;
      computersCount?: number;
      hasOnlinePortal?: boolean;
    };
  };
  
  // Services
  services?: {
    transport?: {
      available: boolean;
      routes?: string[];
      price?: number;
    };
    meals?: {
      available: boolean;
      type?: string;
      price?: number;
      menu?: string;
    };
    extendedDay?: {
      available: boolean;
      hours?: string;
      price?: number;
    };
    medical?: {
      hasNurse?: boolean;
      hasPsychologist?: boolean;
    };
  };
  
  // Admission (for Admission tab)
  admission?: {
    isOpen: boolean;
    deadline?: string;
    requirements?: string[];
    documents?: string[];
    process?: {
      step: number;
      title: string;
      description: string;
    }[];
    hasEntranceExam?: boolean;
    examSubjects?: string[];
    contactPerson?: {
      name: string;
      phone: string;
      email: string;
    };
  };
  
  // Pricing details (for Pricing tab)
  pricing?: {
    tuition?: {
      grades: string;
      monthly: number;
      yearly: number;
      currency: string;
    }[];
    additionalFees?: {
      name: string;
      amount: number;
      frequency: string;
    }[];
    discounts?: {
      name: string;
      percentage: number;
      conditions: string;
    }[];
    scholarships?: {
      name: string;
      description: string;
      coverage: string;
    }[];
    paymentMethods?: string[];
    paymentSchedule?: string;
  };
  
  // Results
  results?: SchoolResult[];
  
  // Photos count for hero
  photosCount?: number;
}

