
export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  country: string;
  status: 'Enrolled' | 'Graduated' | 'Withdrawn' | 'Completed';
  translatedInstitution?: string;
  translatedDegree?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  country: string;
  contractType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Freelance' | 'Volunteer';
  description: string;
  translatedDescription?: string;
}

export interface Certification {
  id: string;
  name: string;
  date: string;
  country: string;
  isDrivingLicense: boolean;
  hasInternationalPermit?: boolean;
}

export interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    furigana: string;
    gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    birthDate: string;
    email: string;
    phone: string;
    address: string;
  };
  visa: {
    type: string;
    expiryDate: string;
    validityRemaining: string;
  };
  education: Education[];
  workExperience: WorkExperience[];
  certifications: Certification[];
  skills: {
    languageLevel: string;
    technicalSkills: string;
    hobbies: string;
  };
  translatedSkills?: {
    languageLevel: string;
    technicalSkills: string;
    hobbies: string;
  };
}

export enum FormStep {
  PERSONAL = 'Personal',
  VISA = 'Visa',
  EDUCATION = 'Education',
  WORK = 'Experience',
  SKILLS = 'Skills',
  PREVIEW = 'Preview'
}
