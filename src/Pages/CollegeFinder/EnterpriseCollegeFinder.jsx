import { useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Brain,
  Sparkles,
  CheckCircle,
  Clock,
  User,
  GraduationCap,
  Briefcase,
  Globe,
  DollarSign,
  Award,
  Target,
  ArrowRight,
  AlertCircle,
  Loader2,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  MapPin,
  Calendar,
  FileText,
  Building2,
  Lightbulb,
  Shield,
  Rocket,
  ChevronRight,
  Check
} from 'lucide-react';
import collegeData from '@/data/collegeData';

// Simple InputField component with key prop to prevent cursor jumping
const InputField = ({ label, field, type = 'text', options = null, required = false, placeholder = '', description = '', formData, errors, onChange }) => {
  const hasError = errors[field];
  const hasValue = formData[field] && formData[field] !== '';

  if (type === 'select') {
    return (
      <div className="space-y-2" key={field}>
        <label className="block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
        <select
          key={`${field}-select`}
          value={formData[field] || ''}
          onChange={(e) => onChange(field, e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : hasValue
              ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
              : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
          }`}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {hasError && (
          <p className="text-red-600 text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  }

  if (type === 'radio') {
    return (
      <div className="space-y-2" key={field}>
        <label className="block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
        <div className="grid grid-cols-2 gap-2">
          {options.map(option => (
            <button
              key={`${field}-${option}`}
              type="button"
              onClick={() => onChange(field, option)}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                formData[field] === option
                  ? 'border-[#145044] bg-[#145044] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#145044]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {hasError && (
          <p className="text-red-600 text-xs flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" key={field}>
      <label className="block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <input
        key={`${field}-input`}
        type={type}
        value={formData[field] || ''}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
          hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : hasValue
            ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20'
            : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20'
        }`}
      />
      {hasError && (
        <p className="text-red-600 text-xs flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {hasError}
        </p>
      )}
    </div>
  );
};

const EnterpriseCollegeFinder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Base Questions (1-23)
    program: '',
    stemRequired: '',
    f1Required: '',
    gpa: '',
    gpaScale: '',
    university: '',
    universityTier: '',
    degree: '',
    mathProgrammingStats: '',
    degreeLength: '',
    mastersDegree: '',
    mastersDetails: '',
    greTotal: '',
    greQuant: '',
    greVerbal: '',
    greAWA: '',
    gmatTotal: '',
    gmatQuant: '',
    gmatVerbal: '',
    gmatAWA: '',
    gmatIR: '',
    englishTest: '',
    englishScore: '',
    intakeYear: '',
    intakeSeason: '',
    // Advanced Questions (24-37)
    workExperience: '',
    industries: '',
    brandFirms: '',
    leadership: '',
    promotions: '',
    research: '',
    publications: '',
    certifications: '',
    citizenship: '',
    gender: '',
    demographicGroup: '',
    budgetConstraints: '',
    maxBudget: '',
    scholarships: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Gemini AI
  const initializeGemini = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔑 Gemini API Key:', apiKey ? 'Available' : 'Missing');

    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found. Using mock responses.');
      return null;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      console.log('✅ Gemini AI initialized successfully');
      return genAI;
    } catch (error) {
      console.error('❌ Error initializing Gemini AI:', error);
      return null;
    }
  };

  const handleInputChange = useCallback((field, value) => {
    console.log(`📝 Field updated: ${field} = ${value}`);

    // Batch state updates to prevent cursor jumping
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors without causing re-render
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const generateRecommendations = async () => {
    console.log('🚀 Starting recommendation generation...');
    console.log('📊 Complete Form Data:', formData);

    setIsSubmitting(true);

    try {
      const genAI = initializeGemini();

      // Create comprehensive prompt for Gemini
      const prompt = `
You are an expert U.S. admissions consultant. Analyze this complete student profile:

PROGRAM & REQUIREMENTS:
- Target Program: ${formData.program}
- STEM Required: ${formData.stemRequired}
- F-1 Required: ${formData.f1Required}

ACADEMIC BACKGROUND:
- GPA: ${formData.gpa} (Scale: ${formData.gpaScale})
- University: ${formData.university} (Tier: ${formData.universityTier})
- Degree: ${formData.degree} (Duration: ${formData.degreeLength})
- Math/Programming/Stats: ${formData.mathProgrammingStats || 'N/A'}
- Master's Degree: ${formData.mastersDegree} ${formData.mastersDetails ? `(${formData.mastersDetails})` : ''}

TEST SCORES:
- GRE: Total ${formData.greTotal || 'N/A'}, Quant ${formData.greQuant || 'N/A'}, Verbal ${formData.greVerbal || 'N/A'}, AWA ${formData.greAWA || 'N/A'}
- GMAT: Total ${formData.gmatTotal || 'N/A'}, Quant ${formData.gmatQuant || 'N/A'}, Verbal ${formData.gmatVerbal || 'N/A'}, AWA ${formData.gmatAWA || 'N/A'}, IR ${formData.gmatIR || 'N/A'}
- English: ${formData.englishTest} (Score: ${formData.englishScore})
- Intake: ${formData.intakeSeason} ${formData.intakeYear}

PROFESSIONAL EXPERIENCE:
- Work Experience: ${formData.workExperience || '0'} years
- Industries: ${formData.industries || 'Not specified'}
- Brand Firms: ${formData.brandFirms || 'N/A'}
- Leadership: ${formData.leadership || 'N/A'}
- Promotions: ${formData.promotions || 'N/A'}
- Research: ${formData.research || 'N/A'}
- Publications: ${formData.publications || 'N/A'}
- Certifications: ${formData.certifications || 'None'}

PERSONAL INFORMATION:
- Citizenship: ${formData.citizenship || 'Not specified'}
- Gender: ${formData.gender || 'Not specified'}
- Demographic Group: ${formData.demographicGroup || 'N/A'}
- Budget Constraints: ${formData.budgetConstraints} ${formData.maxBudget ? `(Max: $${formData.maxBudget})` : ''}
- Scholarships Required: ${formData.scholarships || 'N/A'}

Please provide detailed insights on this student's admission prospects and university recommendations.
`;

      console.log('🧠 Sending comprehensive prompt to Gemini AI...');

      let aiInsights = '';

      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          aiInsights = response.text();
          console.log('✅ Gemini AI Response:', aiInsights);
        } catch (error) {
          console.error('❌ Error calling Gemini AI:', error);
          aiInsights = 'AI analysis temporarily unavailable. Using algorithmic matching based on your comprehensive profile.';
        }
      } else {
        console.log('⚠️ Using mock AI response');
        aiInsights = 'Based on your comprehensive profile including academic background, test scores, and professional experience, our algorithm has analyzed your admission prospects across multiple university tiers.';
      }

      // Enhanced filtering and scoring logic
      console.log('🔍 Advanced college filtering and scoring...');
      let filteredColleges = [...collegeData];

      // Apply all filters
      if (formData.program) {
        filteredColleges = filteredColleges.filter(college =>
          college.programType === formData.program ||
          (formData.program === 'Engineering' && college.programType === 'Engineering')
        );
        console.log(`📋 After program filter: ${filteredColleges.length} colleges`);
      }

      if (formData.stemRequired === 'Yes') {
        filteredColleges = filteredColleges.filter(college => college.stemDesignated);
        console.log(`🔬 After STEM filter: ${filteredColleges.length} colleges`);
      }

      if (formData.f1Required === 'Yes') {
        filteredColleges = filteredColleges.filter(college => college.f1Eligible);
        console.log(`🛂 After F-1 filter: ${filteredColleges.length} colleges`);
      }

      if (formData.degreeLength === '3 years') {
        filteredColleges = filteredColleges.filter(college => college.accepts3Year);
        console.log(`📚 After 3-year degree filter: ${filteredColleges.length} colleges`);
      }

      if (formData.englishTest === 'Duolingo') {
        filteredColleges = filteredColleges.filter(college => college.acceptsDuolingo);
        console.log(`🗣️ After Duolingo filter: ${filteredColleges.length} colleges`);
      }

      if (formData.budgetConstraints === 'Yes' && formData.maxBudget) {
        filteredColleges = filteredColleges.filter(college => {
          const tuition = parseInt(college.tuition.replace(/[^0-9]/g, ''));
          return tuition <= parseInt(formData.maxBudget);
        });
        console.log(`💰 After budget filter: ${filteredColleges.length} colleges`);
      }

      // Enhanced scoring algorithm
      const scoredColleges = filteredColleges.map(college => {
        let score = 0;
        let probability = 0;

        console.log(`📊 Comprehensive scoring for ${college.university}...`);

        // GPA scoring (30% weight)
        const normalizedGPA = normalizeGPA(formData.gpa, formData.gpaScale);
        if (normalizedGPA >= college.gpaRequirement) {
          score += 300;
          console.log(`✅ GPA advantage: ${normalizedGPA} >= ${college.gpaRequirement}`);
        } else {
          const gpaScore = (normalizedGPA / college.gpaRequirement) * 250;
          score += gpaScore;
          console.log(`⚠️ GPA below requirement: ${normalizedGPA} < ${college.gpaRequirement}`);
        }

        // Test scores (25% weight)
        if (formData.greTotal && college.greRequirement) {
          const greScore = parseInt(formData.greTotal);
          if (greScore >= college.greRequirement) {
            score += 250;
            console.log(`✅ GRE advantage: ${greScore} >= ${college.greRequirement}`);
          } else {
            const testScore = (greScore / college.greRequirement) * 200;
            score += testScore;
            console.log(`⚠️ GRE below requirement: ${greScore} < ${college.greRequirement}`);
          }
        }

        if (formData.gmatTotal && college.gmatRequirement) {
          const gmatScore = parseInt(formData.gmatTotal);
          if (gmatScore >= college.gmatRequirement) {
            score += 250;
            console.log(`✅ GMAT advantage: ${gmatScore} >= ${college.gmatRequirement}`);
          } else {
            const testScore = (gmatScore / college.gmatRequirement) * 200;
            score += testScore;
            console.log(`⚠️ GMAT below requirement: ${gmatScore} < ${college.gmatRequirement}`);
          }
        }

        // Work experience (20% weight)
        const workYears = parseInt(formData.workExperience) || 0;
        if (workYears > 0) {
          score += Math.min(workYears * 30, 200);
          console.log(`💼 Work experience: ${workYears} years (+${Math.min(workYears * 30, 200)} points)`);
        }

        // Leadership and achievements (15% weight)
        if (formData.leadership === 'Yes') {
          score += 75;
          console.log(`👑 Leadership experience (+75 points)`);
        }
        if (formData.research === 'Yes') {
          score += 50;
          console.log(`🔬 Research experience (+50 points)`);
        }
        if (formData.publications === 'Yes') {
          score += 75;
          console.log(`📚 Publications (+75 points)`);
        }

        // University tier bonus (10% weight)
        const tierBonus = {
          'IIT': 100,
          'NIT': 80,
          'Tier-1': 60,
          'Tier-2': 40,
          'Tier-3': 20
        };
        const bonus = tierBonus[formData.universityTier] || 0;
        score += bonus;
        if (bonus > 0) {
          console.log(`🏛️ University tier bonus: ${formData.universityTier} (+${bonus} points)`);
        }

        // Calculate probability
        if (score >= 900) probability = Math.min(90, score / 10);
        else if (score >= 700) probability = Math.min(75, score / 12);
        else if (score >= 500) probability = Math.min(60, score / 15);
        else probability = Math.min(40, score / 20);

        // Determine tier
        let tier;
        if (probability >= 80) tier = 'backup';
        else if (probability >= 60) tier = 'safe';
        else if (probability >= 40) tier = 'target';
        else tier = 'ambitious';

        console.log(`📈 ${college.university}: Score ${score}, Probability ${probability}%, Tier ${tier}`);

        return {
          ...college,
          score,
          probability: Math.round(probability),
          tier
        };
      });

      // Sort and distribute
      const sortedColleges = scoredColleges.sort((a, b) => b.probability - a.probability);
      console.log('🏆 Top colleges by probability:', sortedColleges.slice(0, 5).map(c => `${c.university}: ${c.probability}%`));

      // Group by tiers
      const ambitious = sortedColleges.filter(c => c.tier === 'ambitious').slice(0, 5);
      const target = sortedColleges.filter(c => c.tier === 'target').slice(0, 5);
      const safe = sortedColleges.filter(c => c.tier === 'safe').slice(0, 5);
      const backup = sortedColleges.filter(c => c.tier === 'backup').slice(0, 5);

      const recommendations = {
        ambitious,
        target,
        safe,
        backup,
        total: ambitious.length + target.length + safe.length + backup.length,
        aiInsights
      };

      console.log('📋 Final comprehensive recommendations:', {
        ambitious: ambitious.length,
        target: target.length,
        safe: safe.length,
        backup: backup.length,
        total: recommendations.total
      });

      // Navigate to results
      navigate('/university-finder/results', {
        state: {
          recommendations,
          responses: formData,
          aiInsights
        }
      });

    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      alert('Error generating recommendations. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeGPA = (gpa, scale) => {
    const numericGPA = parseFloat(gpa);
    if (scale === '4.0') return numericGPA;
    if (scale === '10.0') return (numericGPA / 10) * 4;
    if (scale === 'Percentage') return (numericGPA / 100) * 4;
    return numericGPA;
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Program & Requirements</h2>
              <p className="text-gray-600 text-sm">Tell us about your target program and visa requirements</p>
            </div>

            <InputField
              label="1. Which program do you want to apply for?"
              field="program"
              type="select"
              options={['MSCS', 'MBA', 'MS Finance', 'MS Marketing', 'MS Data Science', 'Engineering', 'MS Business Analytics']}
              required
              description="Choose your target program for higher education"
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="2. Do you require only STEM-designated programs?"
                field="stemRequired"
                type="radio"
                options={['Yes', 'No']}
                required
                description="STEM programs offer extended OPT work authorization"
              />

              <InputField
                label="3. Do you require only F-1 visa eligible programs?"
                field="f1Required"
                type="radio"
                options={['Yes', 'No']}
                required
                description="Essential for international student visa status"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Academic Background</h2>
              <p className="text-gray-600 text-sm">Share your educational background and achievements</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="4. What is your undergraduate GPA?"
                field="gpa"
                type="number"
                placeholder="e.g., 3.5 or 8.5"
                required
                description="Your cumulative grade point average"
              />

              <InputField
                label="GPA Scale"
                field="gpaScale"
                type="select"
                options={['4.0', '10.0', 'Percentage']}
                required
                description="The grading scale used by your university"
              />
            </div>

            <InputField
              label="5. What is the name of your undergraduate university?"
              field="university"
              placeholder="e.g., Delhi University, IIT Bombay"
              required
              description="Full name of your undergraduate institution"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="6. What is the tier of your university?"
                field="universityTier"
                type="select"
                options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']}
                required
                description="Classification based on reputation and ranking"
              />

              <InputField
                label="9. Was your undergraduate program 3 years or 4 years?"
                field="degreeLength"
                type="select"
                options={['3 years', '4 years']}
                required
                description="Duration of your bachelor's degree program"
              />
            </div>

            <InputField
              label="7. What is the name of your undergraduate degree?"
              field="degree"
              placeholder="e.g., Computer Science Engineering"
              required
              description="Your major field of study or specialization"
            />

            {(formData.program === 'MSCS' || formData.program === 'MS Data Science') && (
              <InputField
                label="8. Did your degree include Mathematics, Programming, and Statistics coursework?"
                field="mathProgrammingStats"
                type="radio"
                options={['Yes', 'No']}
                description="Essential prerequisites for CS and Data Science programs"
              />
            )}

            <InputField
              label="10. Have you completed any master's degree?"
              field="mastersDegree"
              type="radio"
              options={['Yes', 'No']}
              description="Any previous graduate-level education"
            />

            {formData.mastersDegree === 'Yes' && (
              <InputField
                label="Master's degree details"
                field="mastersDetails"
                placeholder="Specify your master's degree program"
                description="Name and details of your master's degree"
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Scores & Proficiency</h2>
              <p className="text-gray-600 text-sm">Share your standardized test results and English proficiency</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-900 text-sm">Standardized Tests</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="11. What is your GRE total score?"
                  field="greTotal"
                  type="number"
                  placeholder="260-340"
                  description="Combined Verbal and Quantitative scores"
                />

                <InputField
                  label="15. What is your GMAT total score?"
                  field="gmatTotal"
                  type="number"
                  placeholder="200-800"
                  description="Total GMAT score (if taken instead of GRE)"
                />
              </div>

              {formData.greTotal && (
                <div className="grid md:grid-cols-3 gap-4 p-3 bg-white rounded-lg">
                  <InputField
                    label="12. GRE Quantitative score"
                    field="greQuant"
                    type="number"
                    placeholder="130-170"
                  />
                  <InputField
                    label="13. GRE Verbal score"
                    field="greVerbal"
                    type="number"
                    placeholder="130-170"
                  />
                  <InputField
                    label="14. GRE AWA score"
                    field="greAWA"
                    type="number"
                    placeholder="0-6"
                  />
                </div>
              )}

              {formData.gmatTotal && (
                <div className="grid md:grid-cols-2 gap-4 p-3 bg-white rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label="16. GMAT Quantitative"
                      field="gmatQuant"
                      type="number"
                      placeholder="6-51"
                    />
                    <InputField
                      label="17. GMAT Verbal"
                      field="gmatVerbal"
                      type="number"
                      placeholder="6-51"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label="18. GMAT AWA"
                      field="gmatAWA"
                      type="number"
                      placeholder="0-6"
                    />
                    <InputField
                      label="19. GMAT IR"
                      field="gmatIR"
                      type="number"
                      placeholder="1-8"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-900 text-sm">English Proficiency & Timeline</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="20. Which English test did you take?"
                  field="englishTest"
                  type="select"
                  options={['TOEFL', 'IELTS', 'Duolingo']}
                  required
                  description="Required for international students"
                />

                <InputField
                  label="21. What is your English test score?"
                  field="englishScore"
                  type="number"
                  placeholder="Enter your score"
                  required
                  description="Your official English proficiency score"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="22. What is your intended intake year?"
                  field="intakeYear"
                  type="select"
                  options={['2024', '2025', '2026']}
                  required
                  description="Year you plan to start your program"
                />

                <InputField
                  label="23. What is your intended intake season?"
                  field="intakeSeason"
                  type="select"
                  options={['Fall', 'Spring', 'Summer']}
                  required
                  description="Semester you prefer to begin"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Professional Excellence</h2>
              <p className="text-gray-600 text-sm">Tell us about your work experience and achievements</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="24. How many years of full-time work experience do you have?"
                field="workExperience"
                type="number"
                placeholder="Enter years (0 if none)"
                description="Total years in professional roles"
              />

              <InputField
                label="25. Which industries have you worked in?"
                field="industries"
                placeholder="e.g., Technology, Finance, Healthcare"
                description="Your professional domain expertise"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="26. Have you worked at multinational or brand-name firms?"
                field="brandFirms"
                type="radio"
                options={['Yes', 'No']}
                description="Experience at well-recognized companies"
              />

              <InputField
                label="27. Have you held leadership or managerial roles?"
                field="leadership"
                type="radio"
                options={['Yes', 'No']}
                description="Team management and leadership experience"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="28. Have you received promotions?"
                field="promotions"
                type="radio"
                options={['Yes', 'No']}
                description="Career advancement and growth"
              />

              <InputField
                label="29. Do you have research experience?"
                field="research"
                type="radio"
                options={['Yes', 'No']}
                description="Academic or industrial research background"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="30. Have you published papers/thesis or presented at conferences?"
                field="publications"
                type="radio"
                options={['Yes', 'No']}
                description="Academic publications and conference presentations"
              />

              <InputField
                label="31. Do you have certifications?"
                field="certifications"
                type="select"
                options={['CFA', 'PMP', 'AWS', 'Data Science', 'Marketing Analytics', 'Other', 'None']}
                description="Professional certifications and credentials"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Profile</h2>
              <p className="text-gray-600 text-sm">Final details to personalize your recommendations</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="32. What is your citizenship?"
                field="citizenship"
                placeholder="Enter your country of citizenship"
                description="Your country of nationality"
              />

              <InputField
                label="33. What is your gender?"
                field="gender"
                type="select"
                options={['Male', 'Female', 'Other', 'Prefer not to say']}
                description="Gender identity (optional for diversity metrics)"
              />
            </div>

            <InputField
              label="34. Do you belong to an over-represented demographic group?"
              field="demographicGroup"
              type="radio"
              options={['Yes', 'No']}
              description="Helps assess diversity factors in admissions"
            />

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-900 text-sm">Financial Planning</h3>

              <InputField
                label="35. Do you have budget constraints?"
                field="budgetConstraints"
                type="radio"
                options={['Yes', 'No']}
                description="Whether cost is a limiting factor for your education"
              />

              {formData.budgetConstraints === 'Yes' && (
                <InputField
                  label="36. What is your maximum tuition budget?"
                  field="maxBudget"
                  type="number"
                  placeholder="e.g., 50000"
                  description="Maximum annual tuition you can afford (in USD)"
                />
              )}

              <InputField
                label="37. Do you require scholarships?"
                field="scholarships"
                type="radio"
                options={['Yes', 'No']}
                description="Need for financial aid or merit-based scholarships"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-[#145044] rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-8 w-8 text-white" />
            <Loader2 className="absolute h-6 w-6 text-white animate-spin" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Processing Your Profile
          </h2>

          <p className="text-gray-600 mb-6">
            AI is analyzing your 37 data points to find perfect university matches...
          </p>

          <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
            <div className="h-1 bg-[#145044] rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>

          <p className="text-sm text-gray-500">This will take just a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Clean, Professional Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#145044] rounded-xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              University Recommendation System
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete our comprehensive assessment to receive AI-powered university recommendations tailored to your profile.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-center items-center space-x-4 mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step
                      ? 'bg-[#145044] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < 5 && (
                    <div className={`w-12 h-0.5 mx-2 transition-colors ${
                      currentStep > step ? 'bg-[#145044]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 5 • Questions {((currentStep - 1) * 7) + 1}-{Math.min(currentStep * 7, 37)} of 37
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 md:p-8">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="w-full md:w-auto order-2 md:order-1"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Previous
              </Button>

              <div className="flex items-center space-x-2 order-1 md:order-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-[#145044]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextStep}
                className="w-full md:w-auto bg-[#145044] hover:bg-[#0f3c34] order-3"
              >
                {currentStep === 5 ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Universities
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnterpriseCollegeFinder;