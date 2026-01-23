// Mock College Data for CollegeFinder
export const collegeData = [
  // Computer Science Programs
  {
    id: 1,
    university: "Stanford University",
    program: "MS Computer Science",
    location: "Stanford, CA",
    length: "2 years",
    tuition: "$58,416/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.7,
    greRequirement: 320,
    toeflRequirement: 100,
    acceptanceRate: 12,
    ranking: 2,
    programType: "MSCS",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: false,
    acceptsDuolingo: false,
    features: ["Research Opportunities", "Silicon Valley Location", "Top Faculty"]
  },
  {
    id: 2,
    university: "Carnegie Mellon University",
    program: "MS Computer Science",
    location: "Pittsburgh, PA",
    length: "2 years",
    tuition: "$55,816/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.6,
    greRequirement: 315,
    toeflRequirement: 100,
    acceptanceRate: 15,
    ranking: 1,
    programType: "MSCS",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: false,
    acceptsDuolingo: true,
    features: ["World-class CS Program", "Industry Connections", "Research Excellence"]
  },
  {
    id: 3,
    university: "University of California, Berkeley",
    program: "MS Computer Science",
    location: "Berkeley, CA",
    length: "2 years",
    tuition: "$46,980/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.5,
    greRequirement: 315,
    toeflRequirement: 90,
    acceptanceRate: 18,
    ranking: 3,
    programType: "MSCS",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Public Ivy", "Tech Hub Access", "Strong Alumni Network"]
  },
  {
    id: 4,
    university: "Georgia Institute of Technology",
    program: "MS Computer Science",
    location: "Atlanta, GA",
    length: "2 years",
    tuition: "$29,140/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "target",
    gpaRequirement: 3.3,
    greRequirement: 310,
    toeflRequirement: 90,
    acceptanceRate: 25,
    ranking: 8,
    programType: "MSCS",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Affordable Tuition", "Strong Industry Ties", "Online Option Available"]
  },
  {
    id: 5,
    university: "University of Texas at Austin",
    program: "MS Computer Science",
    location: "Austin, TX",
    length: "2 years",
    tuition: "$38,826/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "target",
    gpaRequirement: 3.2,
    greRequirement: 305,
    toeflRequirement: 79,
    acceptanceRate: 30,
    ranking: 10,
    programType: "MSCS",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Growing Tech Scene", "Research Opportunities", "Reasonable Cost"]
  },

  // MBA Programs
  {
    id: 6,
    university: "Harvard Business School",
    program: "MBA",
    location: "Boston, MA",
    length: "2 years",
    tuition: "$73,440/year",
    stemDesignated: false,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.7,
    gmatRequirement: 730,
    toeflRequirement: 109,
    acceptanceRate: 11,
    ranking: 1,
    programType: "MBA",
    prerequisites: [],
    accepts3Year: true,
    acceptsDuolingo: false,
    workExperienceRequired: 4,
    features: ["Top Global Brand", "Extensive Alumni Network", "Case Method"]
  },
  {
    id: 7,
    university: "Stanford Graduate School of Business",
    program: "MBA",
    location: "Stanford, CA",
    length: "2 years",
    tuition: "$74,706/year",
    stemDesignated: false,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.8,
    gmatRequirement: 734,
    toeflRequirement: 100,
    acceptanceRate: 6,
    ranking: 2,
    programType: "MBA",
    prerequisites: [],
    accepts3Year: true,
    acceptsDuolingo: false,
    workExperienceRequired: 4,
    features: ["Entrepreneurship Focus", "Silicon Valley", "Small Class Size"]
  },

  // MS Finance Programs
  {
    id: 8,
    university: "Princeton University",
    program: "MS Finance",
    location: "Princeton, NJ",
    length: "2 years",
    tuition: "$56,010/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.7,
    gmatRequirement: 720,
    toeflRequirement: 100,
    acceptanceRate: 8,
    ranking: 1,
    programType: "MS Finance",
    prerequisites: ["Mathematics", "Statistics"],
    accepts3Year: false,
    acceptsDuolingo: false,
    features: ["Quantitative Focus", "Wall Street Access", "Small Cohort"]
  },
  {
    id: 9,
    university: "University of Rochester - Simon",
    program: "MS Finance",
    location: "Rochester, NY",
    length: "1 year",
    tuition: "$52,974/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "target",
    gpaRequirement: 3.3,
    gmatRequirement: 650,
    toeflRequirement: 100,
    acceptanceRate: 35,
    ranking: 8,
    programType: "MS Finance",
    prerequisites: ["Mathematics", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Strong ROI", "Finance Focus", "Good Placement"]
  },

  // MS Marketing Programs
  {
    id: 10,
    university: "Northwestern University - Kellogg",
    program: "MS Marketing Analytics",
    location: "Evanston, IL",
    length: "15 months",
    tuition: "$71,544/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.5,
    gmatRequirement: 700,
    toeflRequirement: 104,
    acceptanceRate: 20,
    ranking: 3,
    programType: "MS Marketing",
    prerequisites: [],
    accepts3Year: true,
    acceptsDuolingo: false,
    features: ["Analytics Focus", "Top Marketing School", "Industry Connections"]
  },

  // Data Science Programs
  {
    id: 11,
    university: "University of California, San Diego",
    program: "MS Data Science",
    location: "San Diego, CA",
    length: "2 years",
    tuition: "$28,755/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "target",
    gpaRequirement: 3.3,
    greRequirement: 310,
    toeflRequirement: 85,
    acceptanceRate: 28,
    ranking: 15,
    programType: "MS Data Science",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Interdisciplinary Program", "Research Opportunities", "Tech Industry Access"]
  },
  {
    id: 12,
    university: "New York University",
    program: "MS Data Science",
    location: "New York, NY",
    length: "2 years",
    tuition: "$57,918/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "target",
    gpaRequirement: 3.4,
    greRequirement: 315,
    toeflRequirement: 100,
    acceptanceRate: 25,
    ranking: 12,
    programType: "MS Data Science",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["NYC Location", "Industry Partnerships", "Practical Curriculum"]
  },

  // Engineering Programs
  {
    id: 13,
    university: "Massachusetts Institute of Technology",
    program: "MS Mechanical Engineering",
    location: "Cambridge, MA",
    length: "2 years",
    tuition: "$53,450/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "ambitious",
    gpaRequirement: 3.7,
    greRequirement: 320,
    toeflRequirement: 100,
    acceptanceRate: 12,
    ranking: 1,
    programType: "Engineering",
    prerequisites: ["Mathematics", "Physics", "Engineering Fundamentals"],
    accepts3Year: false,
    acceptsDuolingo: false,
    features: ["World-class Research", "Innovation Hub", "Top Faculty"]
  },
  {
    id: 14,
    university: "University of Michigan - Ann Arbor",
    program: "MS Industrial Engineering",
    location: "Ann Arbor, MI",
    length: "2 years",
    tuition: "$49,508/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "target",
    gpaRequirement: 3.4,
    greRequirement: 310,
    toeflRequirement: 84,
    acceptanceRate: 30,
    ranking: 5,
    programType: "Engineering",
    prerequisites: ["Mathematics", "Statistics", "Engineering"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Strong Industry Connections", "Research Excellence", "Diverse Opportunities"]
  },

  // Safe and Backup Options
  {
    id: 15,
    university: "Arizona State University",
    program: "MS Computer Science",
    location: "Tempe, AZ",
    length: "2 years",
    tuition: "$31,200/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "safe",
    gpaRequirement: 3.0,
    greRequirement: 300,
    toeflRequirement: 80,
    acceptanceRate: 50,
    ranking: 25,
    programType: "MSCS",
    prerequisites: ["Mathematics", "Programming"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Large Program", "Online Options", "Affordable"]
  },
  {
    id: 16,
    university: "University of South Florida",
    program: "MS Computer Science",
    location: "Tampa, FL",
    length: "2 years",
    tuition: "$17,324/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "backup",
    gpaRequirement: 2.8,
    greRequirement: 295,
    toeflRequirement: 79,
    acceptanceRate: 65,
    ranking: 45,
    programType: "MSCS",
    prerequisites: ["Programming"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Very Affordable", "Growing Program", "Good Location"]
  },
  {
    id: 17,
    university: "University at Buffalo - SUNY",
    program: "MS Data Science",
    location: "Buffalo, NY",
    length: "2 years",
    tuition: "$27,750/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "safe",
    gpaRequirement: 3.1,
    greRequirement: 305,
    toeflRequirement: 79,
    acceptanceRate: 45,
    ranking: 30,
    programType: "MS Data Science",
    prerequisites: ["Mathematics", "Programming", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["SUNY System", "Research Focus", "Affordable Tuition"]
  },
  {
    id: 18,
    university: "San Jose State University",
    program: "MS Data Analytics",
    location: "San Jose, CA",
    length: "2 years",
    tuition: "$20,448/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "backup",
    gpaRequirement: 2.9,
    greRequirement: 300,
    toeflRequirement: 80,
    acceptanceRate: 60,
    ranking: 50,
    programType: "MS Data Science",
    prerequisites: ["Mathematics", "Statistics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Silicon Valley Location", "Industry Connections", "Practical Program"]
  },
  {
    id: 19,
    university: "University of Cincinnati",
    program: "MS Business Analytics",
    location: "Cincinnati, OH",
    length: "1 year",
    tuition: "$24,012/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "safe",
    gpaRequirement: 3.2,
    gmatRequirement: 600,
    toeflRequirement: 80,
    acceptanceRate: 40,
    ranking: 35,
    programType: "MS Business Analytics",
    prerequisites: [],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Short Duration", "Business Focus", "Good ROI"]
  },
  {
    id: 20,
    university: "University of Houston",
    program: "MS Finance",
    location: "Houston, TX",
    length: "1.5 years",
    tuition: "$22,364/year",
    stemDesignated: true,
    f1Eligible: true,
    tier: "backup",
    gpaRequirement: 3.0,
    gmatRequirement: 580,
    toeflRequirement: 79,
    acceptanceRate: 55,
    ranking: 40,
    programType: "MS Finance",
    prerequisites: ["Mathematics"],
    accepts3Year: true,
    acceptsDuolingo: true,
    features: ["Energy Sector Focus", "Affordable", "Growing Program"]
  }
];

// Helper functions for filtering
export const filterByProgram = (data, programType) => {
  return data.filter(college => college.programType === programType);
};

export const filterByStem = (data, stemRequired) => {
  if (!stemRequired) return data;
  return data.filter(college => college.stemDesignated === true);
};

export const filterByF1 = (data, f1Required) => {
  if (!f1Required) return data;
  return data.filter(college => college.f1Eligible === true);
};

export const filterBy3Year = (data, is3Year) => {
  if (!is3Year) return data;
  return data.filter(college => college.accepts3Year === true);
};

export const filterByDuolingo = (data, onlyDuolingo) => {
  if (!onlyDuolingo) return data;
  return data.filter(college => college.acceptsDuolingo === true);
};

export const filterByTier = (data, tier) => {
  return data.filter(college => college.tier === tier);
};

// Program type mappings
export const programTypes = {
  "MSCS": "MS Computer Science",
  "MBA": "MBA",
  "MS Finance": "MS Finance",
  "MS Marketing": "MS Marketing",
  "MS Data Science": "MS Data Science",
  "Engineering": "Engineering",
  "MS Business Analytics": "MS Business Analytics"
};

// University tier mappings for Indian students
export const universityTiers = {
  "IIT": "Tier-1",
  "NIT": "Tier-1",
  "BITS": "Tier-1",
  "IIIT": "Tier-1",
  "Tier-1": "Tier-1",
  "Tier-2": "Tier-2",
  "Tier-3": "Tier-3"
};

export default collegeData;