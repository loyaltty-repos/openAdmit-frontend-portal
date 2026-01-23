// src/data/questions.js
export const QUESTIONS = [
  // === STEP 1: Program Selection ===
  {
    id: "q1",
    step: 1,
    label: "Which program do you want to apply for?",
    field: "program",
    type: "select",
    options: [
      "MSCS",
      "MBA",
      "MS Finance",
      "MS Marketing",
      "MS Data Science",
      "Engineering",
      "MS Business Analytics",
      "MS Management",
      "MS Accounting"
    ],
    required: true,
    description: "Select your target program for higher education",
    placeholder: null,
    grid: "full"
  },

  // === STEP 2: Intake Mode ===
  {
    id: "q2",
    step: 2,
    label: "Do you want Base Questions (short intake) or Advanced Questions (detailed intake)?",
    field: "intakeMode",
    type: "radio",
    options: ["Base Questions (Quick)", "Advanced Questions (Detailed)"],
    required: true,
    description: "Base Questions: Essential information only. Advanced Questions: Comprehensive profile analysis.",
    onChange: (value, setQuestionType) =>
      setQuestionType(value.includes("Base") ? "base" : "advanced"),
    grid: "full"
  },

  // === STEP 3: Base Questions - Part 1 ===
  {
    id: "q3",
    step: 3,
    label: "Do you require only STEM-designated programs?",
    field: "stemRequired",
    type: "radio",
    options: ["Yes", "No"],
    required: true,
    grid: "half"
  },
  {
    id: "q4",
    step: 3,
    label: "Do you require only F-1 visa eligible programs?",
    field: "f1Required",
    type: "radio",
    options: ["Yes", "No"],
    required: true,
    grid: "half"
  },
  {
    id: "q5",
    step: 3,
    label: "What is your undergraduate GPA?",
    field: "gpa",
    type: "text",
    placeholder: "e.g., 3.5",
    required: true,
    description: "Your cumulative grade point average",
    grid: "half"
  },
  {
    id: "q5b",
    step: 3,
    label: null,                     // no separate label
    field: "gpaScale",
    type: "select",
    options: ["4.0", "10.0", "Percentage"],
    required: true,
    description: null,
    grid: "half",
    inlineWith: "q5"                 // tells UI to render inline
  },
  {
    id: "q7",
    step: 3,
    label: "What is the name of your undergraduate university?",
    field: "university",
    type: "text",
    placeholder: "e.g., IIT Delhi, University of Mumbai",
    required: true,
    grid: "full"
  },

  // === STEP 4: Base Questions - Part 2 ===
  {
    id: "q8",
    step: 4,
    label: "What is the tier of your university?",
    field: "universityTier",
    type: "select",
    options: ["IIT", "NIT", "Tier-1", "Tier-2", "Tier-3"],
    required: true,
    grid: "full"
  },
  {
    id: "q9",
    step: 4,
    label: "What is the name of your undergraduate degree?",
    field: "degree",
    type: "text",
    placeholder: "e.g., Computer Science, Mechanical Engineering, Commerce",
    required: true,
    grid: "full"
  },
  {
    id: "q10",
    step: 4,
    label: "Did your degree include Mathematics, Programming, and Statistics coursework?",
    field: "mathProgrammingStats",
    type: "radio",
    options: ["Yes", "No"],
    required: true,
    description: "Required for MSCS and MS Data Science programs",
    condition: (data) => ["MSCS", "MS Data Science"].includes(data.program),
    grid: "full"
  },
  {
    id: "q11",
    step: 4,
    label: "Was your undergraduate program 3 years or 4 years?",
    field: "degreeLength",
    type: "select",
    options: ["3 years", "4 years"],
    required: true,
    grid: "half"
  },
  {
    id: "q12",
    step: 4,
    label: "Have you completed any master's degree?",
    field: "mastersDegree",
    type: "radio",
    options: ["Yes", "No"],
    required: true,
    grid: "half"
  },

  // === STEP 5: Test Scores ===
  {
    id: "q13",
    step: 5,
    label: "What is your GRE score (total)?",
    field: "greTotal",
    type: "text",
    placeholder: "e.g., 320",
    description: "Total GRE score out of 340",
    grid: "half"
  },
  {
    id: "q14",
    step: 5,
    label: "GRE Quant score?",
    field: "greQuant",
    type: "text",
    placeholder: "e.g., 165",
    description: "GRE Quantitative score",
    grid: "half"
  },
  {
    id: "q15",
    step: 5,
    label: "GRE Verbal score?",
    field: "greVerbal",
    type: "text",
    placeholder: "e.g., 155",
    description: "GRE Verbal score",
    grid: "half"
  },
  {
    id: "q16",
    step: 5,
    label: "GRE AWA score?",
    field: "greAWA",
    type: "text",
    placeholder: "e.g., 4.0",
    description: "GRE Analytical Writing score",
    grid: "half"
  },
  {
    id: "q17",
    step: 5,
    label: "If GMAT: What is your GMAT total score?",
    field: "gmatTotal",
    type: "text",
    placeholder: "e.g., 650",
    description: "Total GMAT score out of 800 (if applicable)",
    grid: "half"
  },
  {
    id: "q18",
    step: 5,
    label: "GMAT Quant score?",
    field: "gmatQuant",
    type: "text",
    placeholder: "e.g., 45",
    description: "GMAT Quantitative score",
    grid: "half"
  },

  // === STEP 6: Final Step - Timeline + AI Ready ===
  {
    id: "q19",
    step: 6,
    label: "Preferred intake semester",
    field: "intake",
    type: "select",
    options: ["Fall 2024", "Spring 2025", "Fall 2025", "Spring 2026", "Fall 2026"],
    description: "When do you want to start?",
    grid: "half"
  },
  {
    id: "q20",
    step: 6,
    label: "Program duration preference",
    field: "duration",
    type: "select",
    options: ["1 year", "1.5 years", "2 years", "No preference"],
    description: "Preferred program length",
    grid: "half"
  },

  // AI Ready Message (in Step 6)
  {
    id: "q21",
    step: 6,
    type: "info",
    title: "Ready for AI Analysis",
    message: (dataValidation) =>
      `Once you submit, our AI will analyze your profile against our database of ${
        dataValidation?.stats?.totalRecords || '1000+'
      } university programs to provide personalized recommendations with admission probability scores.`
  }
];