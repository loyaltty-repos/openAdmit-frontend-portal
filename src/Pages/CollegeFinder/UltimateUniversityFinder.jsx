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
  Shield
} from 'lucide-react';
import collegeData from '@/data/collegeData';

const UltimateUniversityFinder = () => {
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

  // Form steps configuration
  const steps = [
    {
      id: 1,
      title: "Program Goals",
      subtitle: "What do you want to study?",
      icon: <Target className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Academic Profile",
      subtitle: "Your educational background",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "from-emerald-500 to-emerald-600"
    },
    {
      id: 3,
      title: "Test Scores",
      subtitle: "Standardized test results",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: 4,
      title: "Experience",
      subtitle: "Work and research background",
      icon: <Briefcase className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 5,
      title: "Personal Details",
      subtitle: "Additional information",
      icon: <User className="h-6 w-6" />,
      color: "from-pink-500 to-pink-600"
    }
  ];

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

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
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
        const factors = [];

        console.log(`📊 Comprehensive scoring for ${college.university}...`);

        // GPA scoring (30% weight)
        const normalizedGPA = normalizeGPA(formData.gpa, formData.gpaScale);
        if (normalizedGPA >= college.gpaRequirement) {
          score += 300;
          factors.push(`✅ GPA advantage: ${normalizedGPA} >= ${college.gpaRequirement}`);
        } else {
          const gpaScore = (normalizedGPA / college.gpaRequirement) * 250;
          score += gpaScore;
          factors.push(`⚠️ GPA below requirement: ${normalizedGPA} < ${college.gpaRequirement}`);
        }

        // Test scores (25% weight)
        if (formData.greTotal && college.greRequirement) {
          const greScore = parseInt(formData.greTotal);
          if (greScore >= college.greRequirement) {
            score += 250;
            factors.push(`✅ GRE advantage: ${greScore} >= ${college.greRequirement}`);
          } else {
            const testScore = (greScore / college.greRequirement) * 200;
            score += testScore;
            factors.push(`⚠️ GRE below requirement: ${greScore} < ${college.greRequirement}`);
          }
        }

        if (formData.gmatTotal && college.gmatRequirement) {
          const gmatScore = parseInt(formData.gmatTotal);
          if (gmatScore >= college.gmatRequirement) {
            score += 250;
            factors.push(`✅ GMAT advantage: ${gmatScore} >= ${college.gmatRequirement}`);
          } else {
            const testScore = (gmatScore / college.gmatRequirement) * 200;
            score += testScore;
            factors.push(`⚠️ GMAT below requirement: ${gmatScore} < ${college.gmatRequirement}`);
          }
        }

        // Work experience (20% weight)
        const workYears = parseInt(formData.workExperience) || 0;
        if (workYears > 0) {
          score += Math.min(workYears * 30, 200);
          factors.push(`💼 Work experience: ${workYears} years (+${Math.min(workYears * 30, 200)} points)`);
        }

        // Leadership and achievements (15% weight)
        if (formData.leadership === 'Yes') {
          score += 75;
          factors.push(`👑 Leadership experience (+75 points)`);
        }
        if (formData.research === 'Yes') {
          score += 50;
          factors.push(`🔬 Research experience (+50 points)`);
        }
        if (formData.publications === 'Yes') {
          score += 75;
          factors.push(`📚 Publications (+75 points)`);
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
          factors.push(`🏛️ University tier bonus: ${formData.universityTier} (+${bonus} points)`);
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
        console.log(`   Factors: ${factors.join(', ')}`);

        return {
          ...college,
          score,
          probability: Math.round(probability),
          tier,
          factors
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
        aiInsights,
        profileSummary: {
          gpa: normalizedGPA,
          testScore: formData.greTotal || formData.gmatTotal || 'N/A',
          workExperience: workYears,
          hasResearch: formData.research === 'Yes',
          hasLeadership: formData.leadership === 'Yes',
          universityTier: formData.universityTier
        }
      };

      console.log('📋 Final comprehensive recommendations:', {
        ambitious: ambitious.length,
        target: target.length,
        safe: safe.length,
        backup: backup.length,
        total: recommendations.total,
        profileSummary: recommendations.profileSummary
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

  const InputField = ({ label, field, type = 'text', options = null, required = false, placeholder = '', icon = null, description = '' }) => {
    const hasError = errors[field];
    const hasValue = formData[field] && formData[field] !== '';

    if (type === 'select') {
      return (
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-800">
            {icon && <span className="mr-2 text-blue-600">{icon}</span>}
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && <p className="text-xs text-gray-500">{description}</p>}
          <div className="relative">
            <select
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`w-full p-4 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 appearance-none text-gray-800 ${
                hasError
                  ? 'border-red-400 focus:border-red-500'
                  : hasValue
                  ? 'border-green-400 focus:border-green-500'
                  : 'border-gray-200 focus:border-blue-400 hover:border-gray-300'
              }`}
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            {hasValue && (
              <Check className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            )}
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    if (type === 'radio') {
      return (
        <div className="space-y-4">
          <label className="flex items-center text-sm font-medium text-gray-800">
            {icon && <span className="mr-2 text-blue-600">{icon}</span>}
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && <p className="text-xs text-gray-500 mb-3">{description}</p>}
          <div className="grid grid-cols-2 gap-3">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange(field, option)}
                className={`p-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${
                  formData[field] === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                }`}
              >
                {option}
                {formData[field] === option && (
                  <Check className="h-4 w-4 mx-auto mt-1 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-800">
          {icon && <span className="mr-2 text-blue-600">{icon}</span>}
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
        <div className="relative">
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`w-full p-4 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 text-gray-800 ${
              hasError
                ? 'border-red-400 focus:border-red-500'
                : hasValue
                ? 'border-green-400 focus:border-green-500'
                : 'border-gray-200 focus:border-blue-400 hover:border-gray-300'
            }`}
          />
          {hasValue && (
            <Check className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
          )}
        </div>
        {hasError && (
          <p className="text-red-500 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Your Academic Goal?</h2>
              <p className="text-gray-600">Tell us about your target program and basic requirements</p>
            </div>

            <InputField
              label="1. Which program do you want to apply for?"
              field="program"
              type="select"
              options={['MSCS', 'MBA', 'MS Finance', 'MS Marketing', 'MS Data Science', 'Engineering', 'MS Business Analytics']}
              required
              icon={<Target className="h-5 w-5" />}
              description="Select your primary target program"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="2. Do you require only STEM-designated programs?"
                field="stemRequired"
                type="radio"
                options={['Yes', 'No']}
                required
                icon={<Lightbulb className="h-5 w-5" />}
                description="STEM programs offer extended OPT benefits"
              />

              <InputField
                label="3. Do you require only F-1 visa eligible programs?"
                field="f1Required"
                type="radio"
                options={['Yes', 'No']}
                required
                icon={<Shield className="h-5 w-5" />}
                description="F-1 eligibility is essential for international students"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Academic Background</h2>
              <p className="text-gray-600">Tell us about your educational history and performance</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="4. What is your undergraduate GPA?"
                field="gpa"
                type="number"
                placeholder="e.g., 3.5 or 8.5"
                required
                icon={<BarChart3 className="h-5 w-5" />}
                description="Enter your GPA in your university's scale"
              />

              <InputField
                label="GPA Scale"
                field="gpaScale"
                type="select"
                options={['4.0', '10.0', 'Percentage']}
                required
                icon={<Target className="h-5 w-5" />}
                description="Select your university's grading scale"
              />
            </div>

            <InputField
              label="5. What is the name of your undergraduate university?"
              field="university"
              placeholder="e.g., Delhi University, IIT Bombay"
              required
              icon={<Building2 className="h-5 w-5" />}
              description="Full name of your undergraduate institution"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="6. What is the tier of your university?"
                field="universityTier"
                type="select"
                options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']}
                required
                icon={<Star className="h-5 w-5" />}
                description="Classification of your university's reputation"
              />

              <InputField
                label="9. Was your undergraduate program 3 years or 4 years?"
                field="degreeLength"
                type="select"
                options={['3 years', '4 years']}
                required
                icon={<Calendar className="h-5 w-5" />}
                description="Duration of your undergraduate program"
              />
            </div>

            <InputField
              label="7. What is the name of your undergraduate degree?"
              field="degree"
              placeholder="e.g., Computer Science Engineering"
              required
              icon={<GraduationCap className="h-5 w-5" />}
              description="Your major or field of study"
            />

            {(formData.program === 'MSCS' || formData.program === 'MS Data Science') && (
              <InputField
                label="8. Did your degree include Mathematics, Programming, and Statistics coursework?"
                field="mathProgrammingStats"
                type="radio"
                options={['Yes', 'No']}
                icon={<Brain className="h-5 w-5" />}
                description="Required for MSCS and Data Science programs"
              />
            )}

            <InputField
              label="10. Have you completed any master's degree?"
              field="mastersDegree"
              type="radio"
              options={['Yes', 'No']}
              icon={<Award className="h-5 w-5" />}
              description="Any previous master's degree"
            />

            {formData.mastersDegree === 'Yes' && (
              <InputField
                label="Master's degree details"
                field="mastersDetails"
                placeholder="Specify your master's degree"
                icon={<FileText className="h-5 w-5" />}
                description="Name and details of your master's degree"
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Test Scores</h2>
              <p className="text-gray-600">Your standardized test results and English proficiency</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">Standardized Tests (GRE/GMAT)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="11. What is your GRE total score?"
                  field="greTotal"
                  type="number"
                  placeholder="260-340"
                  icon={<Award className="h-5 w-5" />}
                  description="Total GRE score (if taken)"
                />

                <InputField
                  label="15. What is your GMAT total score?"
                  field="gmatTotal"
                  type="number"
                  placeholder="200-800"
                  icon={<Star className="h-5 w-5" />}
                  description="Total GMAT score (if taken)"
                />
              </div>

              {formData.greTotal && (
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <InputField
                    label="12. GRE Quantitative score"
                    field="greQuant"
                    type="number"
                    placeholder="130-170"
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                  <InputField
                    label="13. GRE Verbal score"
                    field="greVerbal"
                    type="number"
                    placeholder="130-170"
                    icon={<BookOpen className="h-5 w-5" />}
                  />
                  <InputField
                    label="14. GRE AWA score"
                    field="greAWA"
                    type="number"
                    placeholder="0-6"
                    icon={<FileText className="h-5 w-5" />}
                  />
                </div>
              )}

              {formData.gmatTotal && (
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="16. GMAT Quantitative"
                      field="gmatQuant"
                      type="number"
                      placeholder="6-51"
                      icon={<BarChart3 className="h-5 w-5" />}
                    />
                    <InputField
                      label="17. GMAT Verbal"
                      field="gmatVerbal"
                      type="number"
                      placeholder="6-51"
                      icon={<BookOpen className="h-5 w-5" />}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="18. GMAT AWA"
                      field="gmatAWA"
                      type="number"
                      placeholder="0-6"
                      icon={<FileText className="h-5 w-5" />}
                    />
                    <InputField
                      label="19. GMAT IR"
                      field="gmatIR"
                      type="number"
                      placeholder="1-8"
                      icon={<Brain className="h-5 w-5" />}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-semibold text-green-900 mb-4">English Proficiency & Intake</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="20. Which English test did you take?"
                  field="englishTest"
                  type="select"
                  options={['TOEFL', 'IELTS', 'Duolingo']}
                  required
                  icon={<Globe className="h-5 w-5" />}
                  description="English proficiency test"
                />

                <InputField
                  label="21. What is your English test score?"
                  field="englishScore"
                  type="number"
                  placeholder="Enter your score"
                  required
                  icon={<Award className="h-5 w-5" />}
                  description="Your English test score"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <InputField
                  label="22. What is your intended intake year?"
                  field="intakeYear"
                  type="select"
                  options={['2024', '2025', '2026']}
                  required
                  icon={<Calendar className="h-5 w-5" />}
                  description="Target admission year"
                />

                <InputField
                  label="23. What is your intended intake season?"
                  field="intakeSeason"
                  type="select"
                  options={['Fall', 'Spring', 'Summer']}
                  required
                  icon={<Clock className="h-5 w-5" />}
                  description="Preferred semester for admission"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Professional Experience</h2>
              <p className="text-gray-600">Your work background and achievements</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="24. How many years of full-time work experience do you have?"
                field="workExperience"
                type="number"
                placeholder="Enter years (0 if none)"
                icon={<Briefcase className="h-5 w-5" />}
                description="Total years of professional work"
              />

              <InputField
                label="25. Which industries have you worked in?"
                field="industries"
                placeholder="e.g., Technology, Finance, Healthcare"
                icon={<Building2 className="h-5 w-5" />}
                description="Your professional sectors"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="26. Have you worked at multinational or brand-name firms?"
                field="brandFirms"
                type="radio"
                options={['Yes', 'No']}
                icon={<Star className="h-5 w-5" />}
                description="Experience at well-known companies"
              />

              <InputField
                label="27. Have you held leadership or managerial roles?"
                field="leadership"
                type="radio"
                options={['Yes', 'No']}
                icon={<Users className="h-5 w-5" />}
                description="Leadership and management experience"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="28. Have you received promotions?"
                field="promotions"
                type="radio"
                options={['Yes', 'No']}
                icon={<TrendingUp className="h-5 w-5" />}
                description="Career growth and promotions"
              />

              <InputField
                label="29. Do you have research experience?"
                field="research"
                type="radio"
                options={['Yes', 'No']}
                icon={<Brain className="h-5 w-5" />}
                description="Academic or industry research"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="30. Have you published papers/thesis or presented at conferences?"
                field="publications"
                type="radio"
                options={['Yes', 'No']}
                icon={<FileText className="h-5 w-5" />}
                description="Academic publications and presentations"
              />

              <InputField
                label="31. Do you have certifications?"
                field="certifications"
                type="select"
                options={['CFA', 'PMP', 'AWS', 'Data Science', 'Marketing Analytics', 'Other', 'None']}
                icon={<Award className="h-5 w-5" />}
                description="Professional certifications"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <p className="text-gray-600">Final details to personalize your recommendations</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="32. What is your citizenship?"
                field="citizenship"
                placeholder="Enter your country of citizenship"
                icon={<Globe className="h-5 w-5" />}
                description="Your nationality"
              />

              <InputField
                label="33. What is your gender?"
                field="gender"
                type="select"
                options={['Male', 'Female', 'Other', 'Prefer not to say']}
                icon={<User className="h-5 w-5" />}
                description="Gender identity (optional)"
              />
            </div>

            <InputField
              label="34. Do you belong to an over-represented demographic group?"
              field="demographicGroup"
              type="radio"
              options={['Yes', 'No']}
              icon={<Users className="h-5 w-5" />}
              description="For diversity assessment"
            />

            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="font-semibold text-orange-900 mb-4">Financial Considerations</h3>
              <InputField
                label="35. Do you have budget constraints?"
                field="budgetConstraints"
                type="radio"
                options={['Yes', 'No']}
                icon={<DollarSign className="h-5 w-5" />}
                description="Whether cost is a limiting factor"
              />

              {formData.budgetConstraints === 'Yes' && (
                <div className="mt-6">
                  <InputField
                    label="36. What is your maximum tuition budget?"
                    field="maxBudget"
                    type="number"
                    placeholder="e.g., 50000"
                    icon={<DollarSign className="h-5 w-5" />}
                    description="Maximum annual tuition in USD"
                  />
                </div>
              )}

              <div className="mt-6">
                <InputField
                  label="37. Do you require scholarships?"
                  field="scholarships"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<Award className="h-5 w-5" />}
                  description="Need for financial aid"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <Brain className="h-20 w-20 text-blue-600 mx-auto animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI is Analyzing Your Complete Profile
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Processing all 37 data points including your academic background, test scores,
            work experience, and personal preferences to find the perfect university matches...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Smart University Finder
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete our comprehensive 37-question assessment for AI-powered university recommendations
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`relative ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-110`
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                          <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                          <div className="text-xs text-gray-500">{step.subtitle}</div>
                        </div>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-200 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center text-sm text-gray-600 mt-8">
              Step {currentStep} of {steps.length} • Question {((currentStep - 1) * 7) + 1}-{Math.min(currentStep * 7, 37)} of 37
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="px-8 py-6 bg-gray-50 flex justify-between items-center">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50"
              >
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                {currentStep} / {steps.length}
              </div>

              <Button
                onClick={nextStep}
                className={`px-8 py-3 text-white font-semibold transition-all duration-200 ${
                  currentStep === steps.length
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                }`}
              >
                {currentStep === steps.length ? (
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get My Recommendations
                  </div>
                ) : (
                  <div className="flex items-center">
                    Next
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
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

export default UltimateUniversityFinder;