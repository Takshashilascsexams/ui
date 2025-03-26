// onboarding page utils array
export const gender = ["Male", "Female"];

export const category = [
  "General",
  "OBC",
  "SC",
  "ST(P)",
  "ST(H)",
  "EWS",
  "PwBD/PwD",
];

export const highestEducation = ["Diploma", "Graduate", "Post Graduate"];

export const roles = ["Admin", "Teacher", "Student"];

export const districts = [
  "Baksa",
  "Barpeta",
  "Bajali",
  "Biswanath",
  "Bongaigaon",
  "Cachar",
  "Charaideo",
  "Chirang",
  "Darrang",
  "Dhemaji",
  "Dhubri",
  "Dibrugarh",
  "Dima Hasao",
  "Goalpara",
  "Golaghat",
  "Hailakandi",
  "Hojai",
  "Jorhat",
  "Kamrup Metropolitan",
  "Kamrup Rural",
  "Karbi Anglong",
  "Karimganj",
  "Kokrajhar",
  "Lakhimpur",
  "Majuli",
  "Morigaon",
  "Nagaon",
  "Nalbari",
  "Sivasagar",
  "Sonitpur",
  "South Salmara-Mankachar",
  "Tamulpur",
  "Tinsukia",
  "Udalguri",
  "West Karbi Anglong",
];

// home page utils array
export const testSeriesSectionData = [
  {
    id: 0,
    title: "Assam History",
    description: "Prepare for your exams with our exclusive test series",
    href: "#",
  },
  {
    id: 1,
    title: "Indian Geography",
    description: "Get access to the best test series for your preparation",
    href: "#",
  },
  {
    id: 2,
    title: "Indian Economy",
    description: "Prepare for your exams with our exclusive test series",
    href: "#",
  },
];

export const latestBlogsSectionData = [
  {
    id: 0,
    title: "Improving Answer Writing Skills for UPSC Mains Exam.",
    description: "Learn the best strategies to excel in your exam.",
    href: "https://takshashilascs.com/improving-answer-writing-skills-for-upsc-mains-exam/",
  },
  {
    id: 1,
    title: "Effective Strategies for UPSC Preparaion",
    description: "Get access to the best test series for your preparation",
    href: "https://takshashilascs.com/upsc-preparation-strategy/",
  },
  {
    id: 2,
    title: "Time Management Tips",
    description: "Discover how to manage your time effectively during exams",
    href: "https://takshashilascs.com/time-management-tips-excelling-in-college-and-upsc-together/",
  },
];

export const currentAffairsSectionData = [
  {
    id: 0,
    title: "Important News Updates",
    description: "Stay updated with the latest current affairs",
    href: "https://takshashilascs.com/current-affairs/",
  },
  {
    id: 1,
    title: "Weekly News Digest",
    description: "Get a summary of the most important news of the week",
    href: "https://takshashilascs.com/current-affairs/",
  },
  {
    id: 2,
    title: "Important News Updates",
    description: "Stay updated with the latest current affairs",
    href: "https://takshashilascs.com/current-affairs/",
  },
];

// create-test page utils array
export const difficultyLevel = ["EASY", "MEDIUM", "HARD"];

export const testCategory = ["Test Series", "Screening Test", "Other"];

export const negativeMarkingValue = [0, 2.5, 0.5];

// create-questions utils array
export const marks = ["1", "2"];

export const questionTypes = [
  "MCQ",
  // "MULTIPLE_SELECT",
  // "TRUE_FALSE",
  // "SHORT_ANSWER",
  // "LONG_ANSWER",
  "STATEMENT_BASED",
];

export const negativeMarks = ["0", "0.25", "0.5"];

// create question page utils array
export const sampleQuestions = [
  {
    id: 1,
    title: "Format for MCQ's",
    questionText: "Which planet is known as the Red Planet?",
    options: [
      { optionText: "Venus", isCorrect: false },
      { optionText: "Mars", isCorrect: true },
      { optionText: "Jupiter", isCorrect: false },
      { optionText: "Saturn", isCorrect: false },
    ],
    answer: "(b)",
    explanation:
      "Mars appears reddish because of iron oxide prevalent on its surface.",
    statements: [],
    statementInstructions: "",
  },
  {
    id: 2,
    title: "Format for statement based questions",
    questionText:
      "Consider the following statements regarding Reserve Bank of India (RBI):",
    options: [
      { optionText: "Only one", isCorrect: false },
      { optionText: "Only two", isCorrect: true },
      { optionText: "Only three", isCorrect: false },
      { optionText: "All four", isCorrect: false },
    ],
    statements: [
      {
        statementNumber: 1,
        statementText:
          "RBI was set up based on the recommendations of the Royal Commission on Indian Currency and Finance (1926), also known as the Hilton Young Commission.",
        isCorrect: false,
      },
      {
        statementNumber: 2,
        statementText:
          "RBI was established on April 1, 1935 in accordance with the provisions of the Reserve Bank of India Act, 1934.",
        isCorrect: false,
      },
      {
        statementNumber: 3,
        statementText:
          "RBI was nationalized in 1949 and since then fully owned by the Ministry of Finance under Government of India.",
        isCorrect: false,
      },
      {
        statementNumber: 4,
        statementText:
          "In 2016, the Government of India amended the RBI Act to establish the Monetary Policy Committee.",
        isCorrect: false,
      },
    ],
    statementInstructions: "How many of the above statements is/are correct?",
    answer: "(c)",
    explanation: "Because c is correct.",
  },
];

export const correctAnswer = ["a", "b", "c", "d"];
