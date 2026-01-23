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
  ChevronRight,
  Check
} from 'lucide-react';
import collegeData from '@/data/collegeData';

const ModernUniversityFinder = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Questions
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

    // Test Scores
    testType: '',
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

    // Advanced Questions
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
  const [completedSections, setCompletedSections] = useState(new Set());

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

  const generateRecommendations = async () => {
    console.log('🚀 Starting recommendation generation...');
    console.log('📊 Form Data:', formData);

    setIsSubmitting(true);

    try {
      const genAI = initializeGemini();

      // Create the prompt for Gemini
      const prompt = `
You are an expert U.S. admissions consultant. Based on the following student profile, provide university recommendations:

Student Profile:
- Program: ${formData.program}
- GPA: ${formData.gpa} (Scale: ${formData.gpaScale})
- University: ${formData.university} (Tier: ${formData.universityTier})
- Degree: ${formData.degree} (${formData.degreeLength})
- GRE Total: ${formData.greTotal || 'Not provided'}
- GRE Quant: ${formData.greQuant || 'Not provided'}
- GRE Verbal: ${formData.greVerbal || 'Not provided'}
- GMAT Total: ${formData.gmatTotal || 'Not provided'}
- English Test: ${formData.englishTest} (Score: ${formData.englishScore})
- Work Experience: ${formData.workExperience || '0'} years
- Industries: ${formData.industries || 'Not specified'}
- STEM Required: ${formData.stemRequired}
- F-1 Required: ${formData.f1Required}
- Budget Constraints: ${formData.budgetConstraints} ${formData.maxBudget ? `(Max: $${formData.maxBudget})` : ''}

Please analyze this profile and provide insights on university recommendations.
`;

      console.log('🧠 Sending prompt to Gemini AI...');
      console.log('📝 Prompt:', prompt);

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
          aiInsights = 'AI analysis temporarily unavailable. Using algorithmic matching.';
        }
      } else {
        console.log('⚠️ Using mock AI response');
        aiInsights = 'Using algorithmic matching based on your profile. Your academic background and test scores indicate good potential for admission.';
      }

      // Filter and score colleges
      console.log('🔍 Filtering colleges...');
      let filteredColleges = [...collegeData];

      // Apply basic filters
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

      // Score colleges
      console.log('🎯 Scoring colleges...');
      const scoredColleges = filteredColleges.map(college => {
        let score = 0;
        let probability = 0;

        console.log(`📊 Scoring ${college.university}...`);

        // GPA scoring
        const normalizedGPA = normalizeGPA(formData.gpa, formData.gpaScale);
        if (normalizedGPA >= college.gpaRequirement) {
          score += 250;
          console.log(`✅ GPA advantage: ${normalizedGPA} >= ${college.gpaRequirement}`);
        } else {
          const gpaScore = (normalizedGPA / college.gpaRequirement) * 200;
          score += gpaScore;
          console.log(`⚠️ GPA below requirement: ${normalizedGPA} < ${college.gpaRequirement}, score: ${gpaScore}`);
        }

        // Test score scoring
        if (formData.greTotal && college.greRequirement) {
          const greScore = parseInt(formData.greTotal);
          if (greScore >= college.greRequirement) {
            score += 300;
            console.log(`✅ GRE advantage: ${greScore} >= ${college.greRequirement}`);
          } else {
            const testScore = (greScore / college.greRequirement) * 250;
            score += testScore;
            console.log(`⚠️ GRE below requirement: ${greScore} < ${college.greRequirement}, score: ${testScore}`);
          }
        }

        if (formData.gmatTotal && college.gmatRequirement) {
          const gmatScore = parseInt(formData.gmatTotal);
          if (gmatScore >= college.gmatRequirement) {
            score += 300;
            console.log(`✅ GMAT advantage: ${gmatScore} >= ${college.gmatRequirement}`);
          } else {
            const testScore = (gmatScore / college.gmatRequirement) * 250;
            score += testScore;
            console.log(`⚠️ GMAT below requirement: ${gmatScore} < ${college.gmatRequirement}, score: ${testScore}`);
          }
        }

        // Work experience bonus
        const workYears = parseInt(formData.workExperience) || 0;
        if (workYears > 0) {
          score += Math.min(workYears * 25, 150);
          console.log(`💼 Work experience bonus: ${workYears} years, +${Math.min(workYears * 25, 150)} points`);
        }

        // Calculate probability
        if (score >= 800) probability = Math.min(85, score / 10);
        else if (score >= 600) probability = Math.min(65, score / 12);
        else if (score >= 400) probability = Math.min(45, score / 15);
        else probability = Math.min(25, score / 20);

        // Determine tier
        let tier;
        if (probability >= 80) tier = 'backup';
        else if (probability >= 50) tier = 'safe';
        else if (probability >= 25) tier = 'target';
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

      console.log('📋 Final recommendations:', {
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

  const InputField = ({ label, field, type = 'text', options = null, required = false, placeholder = '', className = '', icon = null }) => {
    const hasError = errors[field];
    const hasValue = formData[field] && formData[field] !== '';

    if (type === 'select') {
      return (
        <div className={`space-y-3 ${className}`}>
          <label className="block text-sm font-semibold text-gray-800 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <select
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`w-full p-4 bg-white border-2 rounded-2xl focus:outline-none transition-all duration-200 appearance-none ${
                hasError
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : hasValue
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 focus:border-primary-400 hover:border-gray-300'
              }`}
            >
              <option value="">Select {label}</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 h-5 w-5 text-gray-400 pointer-events-none" />
            {hasValue && (
              <Check className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
            )}
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center bg-red-50 p-2 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    if (type === 'radio') {
      return (
        <div className={`space-y-4 ${className}`}>
          <label className="block text-sm font-semibold text-gray-800 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange(field, option)}
                className={`group relative p-6 rounded-2xl border-2 text-center font-semibold transition-all duration-200 transform hover:scale-105 ${
                  formData[field] === option
                    ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-800 shadow-lg'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700'
                }`}
              >
                <div className="relative z-10">
                  {option}
                  {formData[field] === option && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                {formData[field] === option && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-2xl"></div>
                )}
              </button>
            ))}
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={`space-y-3 ${className}`}>
        <label className="block text-sm font-semibold text-gray-800 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`w-full p-4 bg-white border-2 rounded-2xl focus:outline-none transition-all duration-200 ${
              hasError
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : hasValue
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 focus:border-primary-400 hover:border-gray-300'
            }`}
          />
          {hasValue && (
            <Check className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-600" />
          )}
        </div>
        {hasError && (
          <p className="text-red-500 text-sm flex items-center bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 mr-2" />
            {hasError}
          </p>
        )}
      </div>
    );
  };

  const FormSection = ({ title, icon, children, gradient = "from-blue-50 to-indigo-50" }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 border border-white/50 shadow-xl backdrop-blur-sm`}>
      <div className="flex items-center mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mr-5">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100/40 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl mr-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-primary-700 to-primary-900 bg-clip-text text-transparent">
              Find Your Perfect University
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Complete this smart form and get AI-powered recommendations tailored specifically to your profile
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-primary-500 mr-2" />
              AI-Powered Analysis
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-primary-500 mr-2" />
              Personalized Results
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
              Success Probability
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Program & Requirements */}
          <FormSection
            title="Program & Requirements"
            icon={<GraduationCap className="h-7 w-7 text-primary-600" />}
            gradient="from-primary-50 to-primary-100"
          >
            <div className="grid md:grid-cols-1 gap-6">
              <InputField
                label="Which program do you want to apply for?"
                field="program"
                type="select"
                options={['MSCS', 'MBA', 'MS Finance', 'MS Marketing', 'MS Data Science', 'Engineering', 'MS Business Analytics']}
                required
                icon={<BookOpen className="h-5 w-5 text-primary-600" />}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="STEM-designated programs required?"
                  field="stemRequired"
                  type="radio"
                  options={['Yes', 'No']}
                  required
                  icon={<Star className="h-5 w-5 text-primary-600" />}
                />
                <InputField
                  label="F-1 visa eligible programs required?"
                  field="f1Required"
                  type="radio"
                  options={['Yes', 'No']}
                  required
                  icon={<Globe className="h-5 w-5 text-primary-600" />}
                />
              </div>
            </div>
          </FormSection>

          {/* Academic Background */}
          <FormSection
            title="Academic Background"
            icon={<BookOpen className="h-7 w-7 text-blue-600" />}
            gradient="from-blue-50 to-blue-100"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Undergraduate GPA"
                  field="gpa"
                  type="number"
                  placeholder="e.g., 3.5 or 8.5"
                  required
                  icon={<Award className="h-5 w-5 text-blue-600" />}
                />
                <InputField
                  label="GPA Scale"
                  field="gpaScale"
                  type="select"
                  options={['4.0', '10.0', 'Percentage']}
                  required
                  icon={<Target className="h-5 w-5 text-blue-600" />}
                />
              </div>
              <InputField
                label="Name of your undergraduate university"
                field="university"
                placeholder="e.g., Delhi University, IIT Bombay"
                required
                icon={<GraduationCap className="h-5 w-5 text-blue-600" />}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Tier of your university"
                  field="universityTier"
                  type="select"
                  options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']}
                  required
                  icon={<Star className="h-5 w-5 text-blue-600" />}
                />
                <InputField
                  label="Undergraduate program duration"
                  field="degreeLength"
                  type="select"
                  options={['3 years', '4 years']}
                  required
                  icon={<Clock className="h-5 w-5 text-blue-600" />}
                />
              </div>
              <InputField
                label="Name of your undergraduate degree"
                field="degree"
                placeholder="e.g., Computer Science Engineering"
                required
                icon={<BookOpen className="h-5 w-5 text-blue-600" />}
              />
              {(formData.program === 'MSCS' || formData.program === 'MS Data Science') && (
                <InputField
                  label="Did your degree include Mathematics, Programming, and Statistics?"
                  field="mathProgrammingStats"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<Brain className="h-5 w-5 text-blue-600" />}
                />
              )}
              <InputField
                label="Have you completed any master's degree?"
                field="mastersDegree"
                type="radio"
                options={['Yes', 'No']}
                icon={<GraduationCap className="h-5 w-5 text-blue-600" />}
              />
              {formData.mastersDegree === 'Yes' && (
                <InputField
                  label="Master's degree details"
                  field="mastersDetails"
                  placeholder="Specify your master's degree"
                  icon={<Award className="h-5 w-5 text-blue-600" />}
                />
              )}
            </div>
          </FormSection>

          {/* Test Scores */}
          <FormSection
            title="Test Scores & English Proficiency"
            icon={<Award className="h-7 w-7 text-emerald-600" />}
            gradient="from-emerald-50 to-emerald-100"
          >
            <div className="space-y-6">
              <InputField
                label="Which standardized test did you take?"
                field="testType"
                type="select"
                options={['GRE', 'GMAT', 'Both', 'None']}
                icon={<Target className="h-5 w-5 text-emerald-600" />}
              />

              {(formData.testType === 'GRE' || formData.testType === 'Both') && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    GRE Scores
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="GRE Total Score"
                      field="greTotal"
                      type="number"
                      placeholder="260-340"
                    />
                    <InputField
                      label="GRE Quantitative"
                      field="greQuant"
                      type="number"
                      placeholder="130-170"
                    />
                    <InputField
                      label="GRE Verbal"
                      field="greVerbal"
                      type="number"
                      placeholder="130-170"
                    />
                    <InputField
                      label="GRE AWA"
                      field="greAWA"
                      type="number"
                      placeholder="0-6"
                    />
                  </div>
                </div>
              )}

              {(formData.testType === 'GMAT' || formData.testType === 'Both') && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    GMAT Scores
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="GMAT Total Score"
                      field="gmatTotal"
                      type="number"
                      placeholder="200-800"
                    />
                    <InputField
                      label="GMAT Quantitative"
                      field="gmatQuant"
                      type="number"
                      placeholder="6-51"
                    />
                    <InputField
                      label="GMAT Verbal"
                      field="gmatVerbal"
                      type="number"
                      placeholder="6-51"
                    />
                    <InputField
                      label="GMAT AWA"
                      field="gmatAWA"
                      type="number"
                      placeholder="0-6"
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="English Test"
                  field="englishTest"
                  type="select"
                  options={['TOEFL', 'IELTS', 'Duolingo']}
                  required
                  icon={<Globe className="h-5 w-5 text-emerald-600" />}
                />
                <InputField
                  label="English Test Score"
                  field="englishScore"
                  type="number"
                  placeholder="Enter your score"
                  required
                  icon={<Award className="h-5 w-5 text-emerald-600" />}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Intended Intake Year"
                  field="intakeYear"
                  type="select"
                  options={['2024', '2025', '2026']}
                  required
                  icon={<Clock className="h-5 w-5 text-emerald-600" />}
                />
                <InputField
                  label="Intended Intake Season"
                  field="intakeSeason"
                  type="select"
                  options={['Fall', 'Spring', 'Summer']}
                  required
                  icon={<Star className="h-5 w-5 text-emerald-600" />}
                />
              </div>
            </div>
          </FormSection>

          {/* Work Experience */}
          <FormSection
            title="Professional Experience"
            icon={<Briefcase className="h-7 w-7 text-purple-600" />}
            gradient="from-purple-50 to-purple-100"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Years of full-time work experience"
                  field="workExperience"
                  type="number"
                  placeholder="Enter years (0 if none)"
                  icon={<Clock className="h-5 w-5 text-purple-600" />}
                />
                <InputField
                  label="Industries you have worked in"
                  field="industries"
                  placeholder="e.g., Technology, Finance, Healthcare"
                  icon={<Briefcase className="h-5 w-5 text-purple-600" />}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Worked at multinational or brand-name firms?"
                  field="brandFirms"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<Star className="h-5 w-5 text-purple-600" />}
                />
                <InputField
                  label="Held leadership or managerial roles?"
                  field="leadership"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Received promotions?"
                  field="promotions"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<Award className="h-5 w-5 text-purple-600" />}
                />
                <InputField
                  label="Do you have research experience?"
                  field="research"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<Brain className="h-5 w-5 text-purple-600" />}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Published papers or presented at conferences?"
                  field="publications"
                  type="radio"
                  options={['Yes', 'No']}
                  icon={<BookOpen className="h-5 w-5 text-purple-600" />}
                />
                <InputField
                  label="Professional certifications"
                  field="certifications"
                  type="select"
                  options={['CFA', 'PMP', 'AWS', 'Data Science', 'Marketing Analytics', 'Other', 'None']}
                  icon={<Award className="h-5 w-5 text-purple-600" />}
                />
              </div>
            </div>
          </FormSection>

          {/* Personal Information */}
          <FormSection
            title="Personal Information & Preferences"
            icon={<User className="h-7 w-7 text-orange-600" />}
            gradient="from-orange-50 to-orange-100"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Citizenship"
                  field="citizenship"
                  placeholder="Enter your country of citizenship"
                  icon={<Globe className="h-5 w-5 text-orange-600" />}
                />
                <InputField
                  label="Gender"
                  field="gender"
                  type="select"
                  options={['Male', 'Female', 'Other', 'Prefer not to say']}
                  icon={<User className="h-5 w-5 text-orange-600" />}
                />
              </div>
              <InputField
                label="Belong to an over-represented demographic group?"
                field="demographicGroup"
                type="radio"
                options={['Yes', 'No']}
                icon={<User className="h-5 w-5 text-orange-600" />}
              />
              <InputField
                label="Do you have budget constraints?"
                field="budgetConstraints"
                type="radio"
                options={['Yes', 'No']}
                icon={<DollarSign className="h-5 w-5 text-orange-600" />}
              />
              {formData.budgetConstraints === 'Yes' && (
                <InputField
                  label="Maximum tuition budget (per year in USD)"
                  field="maxBudget"
                  type="number"
                  placeholder="e.g., 50000"
                  icon={<DollarSign className="h-5 w-5 text-orange-600" />}
                />
              )}
              <InputField
                label="Do you require scholarships?"
                field="scholarships"
                type="radio"
                options={['Yes', 'No']}
                icon={<Award className="h-5 w-5 text-orange-600" />}
              />
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="text-center pt-8">
            <Button
              onClick={generateRecommendations}
              disabled={isSubmitting}
              className="px-16 py-6 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-primary-500/25 transform hover:scale-105 transition-all duration-300 group"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  AI is analyzing your profile...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                  Get My University Recommendations
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
            <p className="text-gray-500 mt-4 text-sm">
              Our AI will analyze your profile and provide personalized recommendations
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ModernUniversityFinder;