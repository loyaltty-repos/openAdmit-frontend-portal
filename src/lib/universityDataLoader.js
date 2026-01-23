// lib/universityDataLoader.js (unchanged, as it supports validation and can be extended for Bachelor data if needed in future)
import { data } from './data.js';

// Extract unique programs from the data
export const getAvailablePrograms = () => {
  const programs = [...new Set(data.map(item => item.program))];
  return programs.filter(program => program && program.trim() !== '').sort();
};

// Get universities by program
export const getUniversitiesByProgram = (programName) => {
  if (!programName) return [];

  return data.filter(item =>
    item.program &&
    item.program.toLowerCase() === programName.toLowerCase()
  );
};

// Get all unique university names
export const getAllUniversities = () => {
  const universities = [...new Set(data.map(item => item.name))];
  return universities.filter(name => name && name.trim() !== '').sort();
};

// Map program display names to internal names
export const PROGRAM_MAPPING = {
  'Computer Science': 'computer science',
  'MBA & Management': 'mba & management',
  'Finance & Accounting': 'finance & accounting',
  'Marketing': 'marketing',
  'Business Analytics': 'business analytics',
  'Civil Engineering': 'civil engineering',
  'Mechanical Engineering': 'mechanical engineering',
  'Electrical Engineering': 'electrical engineering',
  'Biomedical Engineering': 'biomedical engineering',
  'Industrial Engineering': 'industrial & manufacturing & systems engineering',
  'Information Systems & AI': 'information systems & artificial intelligencec',
  'Mathematics': 'mathematics',
  'Statistics': 'statistics',
  'Biotechnology': 'biotechnology',
  'Agricultural Engineering': 'biological & agricultural engineering'
};

// Get display names for dropdown
export const getProgramDisplayNames = () => {
  return Object.keys(PROGRAM_MAPPING);
};

// Convert display name to internal program name
export const getInternalProgramName = (displayName) => {
  return PROGRAM_MAPPING[displayName] || displayName.toLowerCase();
};

// Get program statistics
export const getProgramStats = (programName) => {
  const universities = getUniversitiesByProgram(programName);

  if (universities.length === 0) {
    return {
      totalUniversities: 0,
      averageRanking: null,
      topUniversities: []
    };
  }

  const rankings = universities
    .map(uni => uni.ranking?.national)
    .filter(rank => rank !== null && rank !== undefined);

  const averageRanking = rankings.length > 0
    ? Math.round(rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length)
    : null;

  const topUniversities = universities
    .filter(uni => uni.ranking?.national)
    .sort((a, b) => a.ranking.national - b.ranking.national)
    .slice(0, 10)
    .map(uni => ({
      name: uni.name,
      ranking: uni.ranking.national,
      description: uni.description
    }));

  return {
    totalUniversities: universities.length,
    averageRanking,
    topUniversities
  };
};

// Enhanced university matching with real data
export const getUniversityRecommendations = (userProfile) => {
  const { program, gpa, testScores, preferences } = userProfile;

  const internalProgramName = getInternalProgramName(program);

  // Get universities for the selected program
  let universities = getUniversitiesByProgram(internalProgramName);

  if (universities.length === 0) {
    console.warn(`No universities found for program: ${program}`);
    return {
      ambitious: [],
      target: [],
      safe: [],
      backup: [],
      total: 0
    };
  }

  // Score universities based on user profile
  const scoredUniversities = universities.map(university => {
    let score = 0;
    let probability = 50; // Base probability

    // Ranking-based scoring (better ranking = higher standards)
    if (university.ranking?.national) {
      const ranking = university.ranking.national;
      if (ranking <= 10) {
        probability = 20; // Top 10 universities are very competitive
      } else if (ranking <= 25) {
        probability = 35;
      } else if (ranking <= 50) {
        probability = 55;
      } else if (ranking <= 100) {
        probability = 70;
      } else {
        probability = 85;
      }
    }

    // Adjust based on GPA (simplified)
    if (gpa) {
      const normalizedGPA = parseFloat(gpa);
      if (normalizedGPA >= 3.7) probability += 15;
      else if (normalizedGPA >= 3.5) probability += 10;
      else if (normalizedGPA >= 3.3) probability += 5;
      else if (normalizedGPA < 3.0) probability -= 10;
    }

    // Cap probability at 95%
    probability = Math.min(95, Math.max(5, probability));

    // Determine tier based on probability
    let tier;
    if (probability >= 80) tier = 'backup';
    else if (probability >= 60) tier = 'safe';
    else if (probability >= 40) tier = 'target';
    else tier = 'ambitious';

    return {
      id: university.name + '-' + university.program, // Create unique ID
      name: university.name,
      university: university.name, // For compatibility with results page
      program: university.program,
      location: university.location || 'Location not specified',
      tuition: university.tuition_fees_per_year || 'Tuition not specified',
      description: university.description || 'No description available',
      ranking: university.ranking,
      acceptanceRate: university.acceptance_rate,
      stemDesignated: true, // Default for now
      f1Eligible: true, // Default for now
      accepts3Year: true, // Default for now
      features: ['Research Opportunities', 'Industry Connections'], // Default features
      probability: Math.round(probability),
      tier,
      score
    };
  });

  // Group by tiers
  const recommendations = {
    ambitious: scoredUniversities.filter(u => u.tier === 'ambitious').slice(0, 8),
    target: scoredUniversities.filter(u => u.tier === 'target').slice(0, 8),
    safe: scoredUniversities.filter(u => u.tier === 'safe').slice(0, 8),
    backup: scoredUniversities.filter(u => u.tier === 'backup').slice(0, 8)
  };

  recommendations.total = Object.values(recommendations).reduce((sum, arr) =>
    Array.isArray(arr) ? sum + arr.length : sum, 0);

  return recommendations;
};

// Data validation and health check
export const validateUniversityData = () => {
  const issues = [];

  if (!data || !Array.isArray(data)) {
    issues.push('Data is not an array or is missing');
    return { isValid: false, issues };
  }

  if (data.length === 0) {
    issues.push('Data array is empty');
    return { isValid: false, issues };
  }

  const programs = getAvailablePrograms();
  if (programs.length === 0) {
    issues.push('No programs found in data');
  }

  const universities = getAllUniversities();
  if (universities.length === 0) {
    issues.push('No universities found in data');
  }

  console.log(`✅ Data validation complete:
    📊 Total records: ${data.length}
    🎓 Programs available: ${programs.length}
    🏛️ Universities: ${universities.length}
    ${issues.length > 0 ? '⚠️ Issues: ' + issues.join(', ') : '✅ No issues found'}`);

  return {
    isValid: issues.length === 0,
    issues,
    stats: {
      totalRecords: data.length,
      programs: programs.length,
      universities: universities.length
    }
  };
};