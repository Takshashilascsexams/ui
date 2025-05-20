export type OnboardingDataType = {
  fullName: string;
  careOf: string;
  dateOfBirth: Date;
  gender: string;
  category: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  address: string;
  district: string;
  collegeOrUniversityName?: string;
  highestEducation: string;
  previouslyAttempted: string;
  currentlyEmployed: string;
};

export type newExamDataType = {
  title: string;
  description: string;
  duration: string;
  totalQuestions: string;
  totalMarks: string;
  hasNegativeMarking: string;
  negativeMarkingValue: string;
  passMarkPercentage: string;
  difficultyLevel: string;
  category: string;
  allowNavigation: string;
  isFeatured: string;
  isPremium: string;
  price: string;
  discountPrice: string;
  accessPeriod: string;
};

export type currentAffairsAndBlogsSectionDataType = {
  id: number;
  title: string;
  description: string;
  href: string;
};
