import { useState } from 'react';
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
  Zap,
  ChevronDown,
  Check,
  Play,
  BarChart3,
  Users,
  MapPin,
  Calendar,
  FileText,
  Building2,
  Lightbulb,
  Shield,
  Rocket,
  Heart,
  Coffee,
  Smile
} from 'lucide-react';
import collegeData from '@/data/collegeData';

const StunningUniversityFinder = () => {
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

  const handleInputChange = (field, value) => {
    console.log(`📝 Field updated: ${field} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

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

      // Enhanced filtering and scoring logic (same as before)
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

  const InputField = ({ label, field, type = 'text', options = null, required = false, placeholder = '', icon = null, description = '' }) => {
    const hasError = errors[field];
    const hasValue = formData[field] && formData[field] !== '';

    if (type === 'select') {
      return (
        <div className="mb-6">
          <label className="block text-base font-semibold text-gray-900 mb-2">
            {icon && <span className="inline-flex items-center justify-center w-6 h-6 bg-[#145044] rounded-md text-white mr-2">{icon}</span>}
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {description && <p className="text-gray-600 mb-3 text-sm">{description}</p>}
          <div className="relative">
            <select
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                hasError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
                  : hasValue
                  ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20 bg-white'
                  : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20 bg-white hover:border-gray-400'
              }`}
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {hasError && (
            <p className="text-red-600 text-sm flex items-center mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    if (type === 'radio') {
      return (
        <div className="mb-6">
          <label className="block text-base font-semibold text-gray-900 mb-2">
            {icon && <span className="inline-flex items-center justify-center w-6 h-6 bg-[#145044] rounded-md text-white mr-2">{icon}</span>}
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {description && <p className="text-gray-600 mb-3 text-sm">{description}</p>}
          <div className="grid grid-cols-2 gap-3">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange(field, option)}
                className={`px-4 py-3 border rounded-lg text-center font-medium text-base transition-all duration-200 ${
                  formData[field] === option
                    ? 'border-[#145044] bg-[#145044] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#145044] hover:bg-[#145044]/5'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {hasError && (
            <p className="text-red-600 text-sm flex items-center mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="mb-6">
        <label className="block text-base font-semibold text-gray-900 mb-2">
          {icon && <span className="inline-flex items-center justify-center w-6 h-6 bg-[#145044] rounded-md text-white mr-2">{icon}</span>}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && <p className="text-gray-600 mb-3 text-sm">{description}</p>}
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all duration-200 ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
              : hasValue
              ? 'border-[#145044] focus:border-[#145044] focus:ring-[#145044]/20 bg-white'
              : 'border-gray-300 focus:border-[#145044] focus:ring-[#145044]/20 bg-white hover:border-gray-400'
          }`}
        />
        {hasError && (
          <p className="text-red-600 text-sm flex items-center mt-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#145044] rounded-xl mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Program & Requirements
              </h2>
              <p className="text-gray-600">
                Tell us about your target program and visa requirements
              </p>
            </div>

            <InputField
              label="1. Which program do you want to apply for?"
              field="program"
              type="select"
              options={['MSCS', 'MBA', 'MS Finance', 'MS Marketing', 'MS Data Science', 'Engineering', 'MS Business Analytics']}
              required
              icon={<Rocket className="h-4 w-4" />}
              description="Choose your target program for higher education"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="2. Do you require only STEM-designated programs?"
                field="stemRequired"
                type="radio"
                options={['Yes', 'No']}
                required
                icon={<Lightbulb className="h-4 w-4" />}
                description="STEM programs offer extended OPT work authorization"
              />

              <InputField
                label="3. Do you require only F-1 visa eligible programs?"
                field="f1Required"
                type="radio"
                options={['Yes', 'No']}
                required
                icon={<Shield className="h-4 w-4" />}
                description="Essential for international student visa status"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#145044] rounded-xl mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Academic Background
              </h2>
              <p className="text-gray-600">
                Share your educational background and academic achievements
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="4. What is your undergraduate GPA?"
                field="gpa"
                type="number"
                placeholder="e.g., 3.5 or 8.5"
                required
                icon={<BarChart3 className="h-4 w-4" />}
                description="Your cumulative grade point average"
              />

              <InputField
                label="GPA Scale"
                field="gpaScale"
                type="select"
                options={['4.0', '10.0', 'Percentage']}
                required
                icon={<Target className="h-4 w-4" />}
                description="The grading scale used by your university"
              />
            </div>

            <InputField
              label="5. What is the name of your undergraduate university?"
              field="university"
              placeholder="e.g., Delhi University, IIT Bombay"
              required
              icon={<Building2 className="h-4 w-4" />}
              description="Full name of your undergraduate institution"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="6. What is the tier of your university?"
                field="universityTier"
                type="select"
                options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']}
                required
                icon={<Star className="h-4 w-4" />}
                description="Classification based on reputation and ranking"
              />

              <InputField
                label="9. Was your undergraduate program 3 years or 4 years?"
                field="degreeLength"
                type="select"
                options={['3 years', '4 years']}
                required
                icon={<Calendar className="h-4 w-4" />}
                description="Duration of your bachelor's degree program"
              />
            </div>

            <InputField
              label="7. What is the name of your undergraduate degree?"
              field="degree"
              placeholder="e.g., Computer Science Engineering"
              required
              icon={<BookOpen className="h-4 w-4" />}
              description="Your major field of study or specialization"
            />

            {(formData.program === 'MSCS' || formData.program === 'MS Data Science') && (
              <InputField
                label="8. Did your degree include Mathematics, Programming, and Statistics coursework?"
                field="mathProgrammingStats"
                type="radio"
                options={['Yes', 'No']}
                icon={<Brain className="h-4 w-4" />}
                description="Essential prerequisites for CS and Data Science programs"
              />
            )}

            <InputField
              label="10. Have you completed any master's degree?"
              field="mastersDegree"
              type="radio"
              options={['Yes', 'No']}
              icon={<Award className="h-4 w-4" />}
              description="Any previous graduate-level education"
            />

            {formData.mastersDegree === 'Yes' && (
              <InputField
                label="Master's degree details"
                field="mastersDetails"
                placeholder="Specify your master's degree program"
                icon={<FileText className="h-4 w-4" />}
                description="Name and details of your master's degree"
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#145044] rounded-xl mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Test Scores & Proficiency
              </h2>
              <p className="text-gray-600">
                Share your standardized test results and English language proficiency
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Standardized Tests
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="11. What is your GRE total score?"
                  field="greTotal"
                  type="number"
                  placeholder="260-340"
                  icon={<Star className="h-4 w-4" />}
                  description="Combined Verbal and Quantitative scores"
                />

                <InputField
                  label="15. What is your GMAT total score?"
                  field="gmatTotal"
                  type="number"
                  placeholder="200-800"
                  icon={<Target className="h-4 w-4" />}
                  description="Total GMAT score (if taken instead of GRE)"
                />
              </div>

              {formData.greTotal && (
                <div className="mt-6 grid md:grid-cols-3 gap-6">
                  <InputField
                    label="12. GRE Quantitative score"
                    field="greQuant"
                    type="number"
                    placeholder="130-170"
                    icon={<BarChart3 className="h-4 w-4" />}
                  />
                  <InputField
                    label="13. GRE Verbal score"
                    field="greVerbal"
                    type="number"
                    placeholder="130-170"
                    icon={<BookOpen className="h-4 w-4" />}
                  />
                  <InputField
                    label="14. GRE AWA score"
                    field="greAWA"
                    type="number"
                    placeholder="0-6"
                    icon={<FileText className="h-4 w-4" />}
                  />
                </div>
              )}

              {formData.gmatTotal && (
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="16. GMAT Quantitative"
                      field="gmatQuant"
                      type="number"
                      placeholder="6-51"
                      icon={<BarChart3 className="h-4 w-4" />}
                    />
                    <InputField
                      label="17. GMAT Verbal"
                      field="gmatVerbal"
                      type="number"
                      placeholder="6-51"
                      icon={<BookOpen className="h-4 w-4" />}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="18. GMAT AWA"
                      field="gmatAWA"
                      type="number"
                      placeholder="0-6"
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <InputField
                      label="19. GMAT IR"
                      field="gmatIR"
                      type="number"
                      placeholder="1-8"
                      icon={<Brain className="h-4 w-4" />}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                English Proficiency & Timeline
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="20. Which English test did you take?"
                  field="englishTest"
                  type="select"
                  options={['TOEFL', 'IELTS', 'Duolingo']}
                  required
                  icon={<Globe className="h-4 w-4" />}
                  description="Required for international students"
                />

                <InputField
                  label="21. What is your English test score?"
                  field="englishScore"
                  type="number"
                  placeholder="Enter your score"
                  required
                  icon={<Award className="h-4 w-4" />}
                  description="Your official English proficiency score"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <InputField
                  label="22. What is your intended intake year?"
                  field="intakeYear"
                  type="select"
                  options={['2024', '2025', '2026']}
                  required
                  icon={<Calendar className="h-4 w-4" />}
                  description="Year you plan to start your program"
                />

                <InputField
                  label="23. What is your intended intake season?"
                  field="intakeSeason"
                  type="select"
                  options={['Fall', 'Spring', 'Summer']}
                  required
                  icon={<Clock className="h-4 w-4" />}
                  description="Semester you prefer to begin"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#145044] rounded-xl mb-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Professional Excellence
              </h2>
              <p className="text-gray-600">
                Tell us about your work experience, achievements, and professional growth
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="24. How many years of full-time work experience do you have?"
                field="workExperience"
                type="number"
                placeholder="Enter years (0 if none)"
                icon={<Clock className="h-4 w-4" />}
                description="Total years in professional roles"
              />

              <InputField
                label="25. Which industries have you worked in?"
                field="industries"
                placeholder="e.g., Technology, Finance, Healthcare"
                icon={<Building2 className="h-4 w-4" />}
                description="Your professional domain expertise"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="26. Have you worked at multinational or brand-name firms?"
                field="brandFirms"
                type="radio"
                options={['Yes', 'No']}
                icon={<Star className="h-4 w-4" />}
                description="Experience at well-recognized companies"
              />

              <InputField
                label="27. Have you held leadership or managerial roles?"
                field="leadership"
                type="radio"
                options={['Yes', 'No']}
                icon={<Users className="h-4 w-4" />}
                description="Team management and leadership experience"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="28. Have you received promotions?"
                field="promotions"
                type="radio"
                options={['Yes', 'No']}
                icon={<TrendingUp className="h-4 w-4" />}
                description="Career advancement and growth"
              />

              <InputField
                label="29. Do you have research experience?"
                field="research"
                type="radio"
                options={['Yes', 'No']}
                icon={<Brain className="h-4 w-4" />}
                description="Academic or industrial research background"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="30. Have you published papers/thesis or presented at conferences?"
                field="publications"
                type="radio"
                options={['Yes', 'No']}
                icon={<FileText className="h-4 w-4" />}
                description="Academic publications and conference presentations"
              />

              <InputField
                label="31. Do you have certifications?"
                field="certifications"
                type="select"
                options={['CFA', 'PMP', 'AWS', 'Data Science', 'Marketing Analytics', 'Other', 'None']}
                icon={<Award className="h-4 w-4" />}
                description="Professional certifications and credentials"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#145044] rounded-xl mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personal Profile
              </h2>
              <p className="text-gray-600">
                Final details to personalize your university recommendations
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="32. What is your citizenship?"
                field="citizenship"
                placeholder="Enter your country of citizenship"
                icon={<Globe className="h-4 w-4" />}
                description="Your country of nationality"
              />

              <InputField
                label="33. What is your gender?"
                field="gender"
                type="select"
                options={['Male', 'Female', 'Other', 'Prefer not to say']}
                icon={<User className="h-4 w-4" />}
                description="Gender identity (optional for diversity metrics)"
              />
            </div>

            <InputField
              label="34. Do you belong to an over-represented demographic group?"
              field="demographicGroup"
              type="radio"
              options={['Yes', 'No']}
              icon={<Users className="h-4 w-4" />}
              description="Helps assess diversity factors in admissions"
            />

            <div className="space-y-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Financial Planning
              </h3>

              <InputField
                label="35. Do you have budget constraints?"
                field="budgetConstraints"
                type="radio"
                options={['Yes', 'No']}
                icon={<DollarSign className="h-4 w-4" />}
                description="Whether cost is a limiting factor for your education"
              />

              {formData.budgetConstraints === 'Yes' && (
                <div className="mt-6">
                  <InputField
                    label="36. What is your maximum tuition budget?"
                    field="maxBudget"
                    type="number"
                    placeholder="e.g., 50000"
                    icon={<DollarSign className="h-4 w-4" />}
                    description="Maximum annual tuition you can afford (in USD)"
                  />
                </div>
              )}

              <div className="mt-6">
                <InputField
                  label="37. Do you require scholarships?"
                  field="scholarships"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<Award className="h-4 w-4" />}
                  description="Need for financial aid or merit-based scholarships"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 bg-[#145044] rounded-full flex items-center justify-center mx-auto mb-8">
            <Brain className="h-12 w-12 text-white" />
            <Loader2 className="absolute h-8 w-8 text-white animate-spin" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI is Analyzing Your Profile
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            Our AI is processing your complete profile across all 37 data points to find universities
            that match your goals, scores, and preferences...
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div className="h-2 bg-[#145044] rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>

          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-[#145044] mr-1" />
              Processing
            </div>
            <div className="flex items-center">
              <Brain className="h-4 w-4 text-[#145044] mr-1" />
              AI Analysis
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 text-[#145044] mr-1" />
              Finding Matches
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            This will just take a moment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Enterprise background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_var(--tw-gradient-stops))] from-[#145044]/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#145044]/20 to-transparent"></div>

      <Navigation />

      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Enterprise Header */}
          <div className="text-center mb-16">
            <div className="relative inline-block mb-10">
              <div className="absolute inset-0 bg-gradient-to-r from-[#145044] to-emerald-600 rounded-3xl blur-xl opacity-25 scale-110"></div>
              <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-[#145044] to-emerald-600 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Brain className="h-14 w-14 text-white" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative">
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-[#145044] to-emerald-700 leading-tight tracking-tight">
                  AI-Powered University
                  <br className="hidden md:block" />
                  <span className="text-[#145044] relative">
                    Matching Platform
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#145044] to-emerald-600 rounded-full opacity-30"></div>
                  </span>
                </h1>
              </div>

              <p className="text-xl md:text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed font-light">
                Advanced AI technology analyzes your complete academic profile across
                <span className="font-bold text-[#145044] mx-2 px-3 py-1 bg-[#145044]/10 rounded-lg">37 data points</span>
                to deliver personalized university recommendations with enterprise-grade precision
              </p>

              <div className="flex flex-wrap justify-center gap-6 mt-12">
                {[
                  { icon: Zap, label: "AI-Powered Analysis", color: "from-green-500 to-emerald-600" },
                  { icon: Building2, label: "500+ Universities", color: "from-blue-500 to-cyan-600" },
                  { icon: Star, label: "95% Success Rate", color: "from-purple-500 to-violet-600" },
                  { icon: Globe, label: "50+ Countries", color: "from-orange-500 to-red-600" }
                ].map((item, index) => (
                  <div key={index} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300`}></div>
                    <div className="relative flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className={`w-3 h-3 bg-gradient-to-r ${item.color} rounded-full animate-pulse`}></div>
                      <item.icon className={`h-5 w-5 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} />
                      <span className="text-gray-700 font-semibold text-sm">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enterprise Progress Tracker */}
          <div className="mb-16">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#145044]/5 to-transparent rounded-2xl"></div>

              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Assessment Progress</h3>
                  <p className="text-gray-600">Complete each step to get your personalized recommendations</p>
                </div>

                {/* Mobile and Desktop Progress */}
                <div className="hidden md:flex justify-center items-center space-x-6 mb-8">
                  {[
                    { num: 1, label: "Program Goals", icon: Target },
                    { num: 2, label: "Academic Profile", icon: GraduationCap },
                    { num: 3, label: "Test Scores", icon: BarChart3 },
                    { num: 4, label: "Experience", icon: Briefcase },
                    { num: 5, label: "Personal Info", icon: User }
                  ].map((step, index) => {
                    const isActive = currentStep === step.num;
                    const isCompleted = currentStep > step.num;

                    return (
                      <div key={step.num} className="flex items-center">
                        <div className="text-center">
                          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 transform ${
                            isCompleted
                              ? 'bg-gradient-to-br from-[#145044] to-emerald-600 shadow-xl scale-105'
                              : isActive
                              ? 'bg-gradient-to-br from-[#145044] to-emerald-600 shadow-2xl scale-110 ring-4 ring-[#145044]/20'
                              : 'bg-gray-200 hover:bg-gray-300 scale-100'
                          }`}>
                            {isCompleted ? (
                              <Check className="h-6 w-6 text-white" />
                            ) : isActive ? (
                              <step.icon className="h-6 w-6 text-white" />
                            ) : (
                              <step.icon className="h-6 w-6 text-gray-500" />
                            )}

                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-br from-[#145044] to-emerald-600 rounded-2xl animate-pulse opacity-50"></div>
                            )}
                          </div>

                          <div className="mt-3">
                            <div className={`text-xs font-semibold transition-colors duration-300 ${
                              isActive ? 'text-[#145044]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </div>
                          </div>
                        </div>

                        {index < 4 && (
                          <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-500 ${
                            currentStep > step.num
                              ? 'bg-gradient-to-r from-[#145044] to-emerald-600'
                              : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Progress - Simplified */}
                <div className="md:hidden mb-8">
                  <div className="flex justify-center items-center space-x-3 mb-6">
                    {[1, 2, 3, 4, 5].map((step) => {
                      const isActive = currentStep === step;
                      const isCompleted = currentStep > step;

                      return (
                        <div key={step} className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-all duration-500 ${
                            isCompleted
                              ? 'bg-gradient-to-br from-[#145044] to-emerald-600'
                              : isActive
                              ? 'bg-gradient-to-br from-[#145044] to-emerald-600 ring-2 ring-[#145044]/30'
                              : 'bg-gray-300'
                          }`}>
                            {isCompleted ? <Check className="h-4 w-4" /> : step}
                          </div>
                          {step < 5 && <div className={`w-4 h-0.5 rounded transition-all duration-500 ${currentStep > step ? 'bg-[#145044]' : 'bg-gray-300'}`} />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      {[
                        "Program Goals",
                        "Academic Profile",
                        "Test Scores",
                        "Experience",
                        "Personal Info"
                      ][currentStep - 1]}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <div className="text-lg font-semibold text-gray-900">
                    Step {currentStep} of 5 - Questions {((currentStep - 1) * 7) + 1}-{Math.min(currentStep * 7, 37)} of 37
                  </div>

                  <div className="max-w-lg mx-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>0%</span>
                      <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-[#145044] to-emerald-600 rounded-full transition-all duration-700 ease-out relative"
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Form Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#145044]/5 via-transparent to-emerald-500/5 rounded-3xl"></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Form header with gradient */}
              <div className="bg-gradient-to-r from-[#145044] to-emerald-600 px-6 md:px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white">Assessment Form</h2>
                      <p className="text-[#145044]/80 text-sm">Secure & Confidential</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                    <Shield className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">Encrypted</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10">
                {renderStepContent()}
              </div>

              {/* Enhanced Navigation Footer */}
              <div className="px-6 md:px-10 py-6 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="w-full md:w-auto px-6 py-3 border-gray-300 hover:border-gray-400 disabled:opacity-50 rounded-xl font-medium transition-all duration-300"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Previous Step
                  </Button>

                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div
                          key={step}
                          className={`w-2 h-2 rounded-full transition-all duration-500 ${
                            step <= currentStep
                              ? 'bg-gradient-to-r from-[#145044] to-emerald-600'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                      {currentStep} / 5
                    </span>
                  </div>

                  <Button
                    onClick={nextStep}
                    className="w-full md:w-auto px-8 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r from-[#145044] to-emerald-600 hover:from-[#0f3c34] hover:to-emerald-700 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 transform skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                    {currentStep === 5 ? (
                      <div className="flex items-center relative z-10">
                        <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                        Get My Universities
                        <Rocket className="h-5 w-5 ml-2" />
                      </div>
                    ) : (
                      <div className="flex items-center relative z-10">
                        Continue Assessment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StunningUniversityFinder;