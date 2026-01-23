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
  Loader2
} from 'lucide-react';
import collegeData from '@/data/collegeData';

const ImprovedCollegeFinderForm = () => {
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
  const [currentSection, setCurrentSection] = useState(0);

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

  const sections = [
    {
      title: 'Program & Requirements',
      icon: <GraduationCap className="h-6 w-6" />,
      description: 'Tell us about your target program and basic requirements'
    },
    {
      title: 'Academic Background',
      icon: <BookOpen className="h-6 w-6" />,
      description: 'Your educational background and academic performance'
    },
    {
      title: 'Test Scores',
      icon: <Award className="h-6 w-6" />,
      description: 'Standardized test scores and English proficiency'
    },
    {
      title: 'Work Experience',
      icon: <Briefcase className="h-6 w-6" />,
      description: 'Professional background and achievements'
    },
    {
      title: 'Personal Information',
      icon: <User className="h-6 w-6" />,
      description: 'Additional details to personalize recommendations'
    }
  ];

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

  const validateSection = (sectionIndex) => {
    const newErrors = {};

    switch (sectionIndex) {
      case 0: // Program & Requirements
        if (!formData.program) newErrors.program = 'Program is required';
        if (!formData.stemRequired) newErrors.stemRequired = 'STEM requirement is required';
        if (!formData.f1Required) newErrors.f1Required = 'F-1 requirement is required';
        break;
      case 1: // Academic Background
        if (!formData.gpa) newErrors.gpa = 'GPA is required';
        if (!formData.gpaScale) newErrors.gpaScale = 'GPA scale is required';
        if (!formData.university) newErrors.university = 'University name is required';
        if (!formData.universityTier) newErrors.universityTier = 'University tier is required';
        if (!formData.degree) newErrors.degree = 'Degree name is required';
        if (!formData.degreeLength) newErrors.degreeLength = 'Degree length is required';
        break;
      case 2: // Test Scores
        if (!formData.englishTest) newErrors.englishTest = 'English test is required';
        if (!formData.englishScore) newErrors.englishScore = 'English score is required';
        if (!formData.intakeYear) newErrors.intakeYear = 'Intake year is required';
        if (!formData.intakeSeason) newErrors.intakeSeason = 'Intake season is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, sections.length - 1));
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
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

  const InputField = ({ label, field, type = 'text', options = null, required = false, placeholder = '', className = '' }) => {
    const hasError = errors[field];

    if (type === 'select') {
      return (
        <div className={`space-y-2 ${className}`}>
          <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${
              hasError
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-primary-500'
            }`}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    if (type === 'radio') {
      return (
        <div className={`space-y-3 ${className}`}>
          <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange(field, option)}
                className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                  formData[field] === option
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
                {formData[field] === option && (
                  <CheckCircle className="h-5 w-5 text-primary-600 mx-auto mt-1" />
                )}
              </button>
            ))}
          </div>
          {hasError && (
            <p className="text-red-500 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {hasError}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${
            hasError
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-200 focus:border-primary-500'
          }`}
        />
        {hasError && (
          <p className="text-red-500 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {hasError}
          </p>
        )}
      </div>
    );
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-6">
            <InputField
              label="Which program do you want to apply for?"
              field="program"
              type="select"
              options={['MSCS', 'MBA', 'MS Finance', 'MS Marketing', 'MS Data Science', 'Engineering', 'MS Business Analytics']}
              required
            />
            <InputField
              label="Do you require only STEM-designated programs?"
              field="stemRequired"
              type="radio"
              options={['Yes', 'No']}
              required
            />
            <InputField
              label="Do you require only F-1 visa eligible programs?"
              field="f1Required"
              type="radio"
              options={['Yes', 'No']}
              required
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="Undergraduate GPA"
                field="gpa"
                type="number"
                placeholder="e.g., 3.5 or 8.5"
                required
              />
              <InputField
                label="GPA Scale"
                field="gpaScale"
                type="select"
                options={['4.0', '10.0', 'Percentage']}
                required
              />
            </div>
            <InputField
              label="Name of your undergraduate university"
              field="university"
              placeholder="e.g., Delhi University, IIT Bombay"
              required
            />
            <InputField
              label="Tier of your university"
              field="universityTier"
              type="select"
              options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']}
              required
            />
            <InputField
              label="Name of your undergraduate degree"
              field="degree"
              placeholder="e.g., Computer Science Engineering"
              required
            />
            {(formData.program === 'MSCS' || formData.program === 'MS Data Science') && (
              <InputField
                label="Did your degree include Mathematics, Programming, and Statistics coursework?"
                field="mathProgrammingStats"
                type="radio"
                options={['Yes', 'No']}
              />
            )}
            <InputField
              label="Undergraduate program duration"
              field="degreeLength"
              type="select"
              options={['3 years', '4 years']}
              required
            />
            <InputField
              label="Have you completed any master's degree?"
              field="mastersDegree"
              type="radio"
              options={['Yes', 'No']}
            />
            {formData.mastersDegree === 'Yes' && (
              <InputField
                label="Master's degree details"
                field="mastersDetails"
                placeholder="Specify your master's degree"
              />
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <InputField
              label="Which standardized test did you take?"
              field="testType"
              type="select"
              options={['GRE', 'GMAT', 'Both', 'None']}
            />

            {(formData.testType === 'GRE' || formData.testType === 'Both') && (
              <div className="grid md:grid-cols-2 gap-6 p-6 bg-blue-50 rounded-xl">
                <h4 className="md:col-span-2 font-semibold text-blue-900">GRE Scores</h4>
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
            )}

            {(formData.testType === 'GMAT' || formData.testType === 'Both') && (
              <div className="grid md:grid-cols-2 gap-6 p-6 bg-green-50 rounded-xl">
                <h4 className="md:col-span-2 font-semibold text-green-900">GMAT Scores</h4>
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
                <InputField
                  label="GMAT IR"
                  field="gmatIR"
                  type="number"
                  placeholder="1-8"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="English Test"
                field="englishTest"
                type="select"
                options={['TOEFL', 'IELTS', 'Duolingo']}
                required
              />
              <InputField
                label="English Test Score"
                field="englishScore"
                type="number"
                placeholder="Enter your score"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="Intended Intake Year"
                field="intakeYear"
                type="select"
                options={['2024', '2025', '2026']}
                required
              />
              <InputField
                label="Intended Intake Season"
                field="intakeSeason"
                type="select"
                options={['Fall', 'Spring', 'Summer']}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <InputField
              label="Years of full-time work experience"
              field="workExperience"
              type="number"
              placeholder="Enter years (0 if none)"
            />
            <InputField
              label="Industries you have worked in"
              field="industries"
              placeholder="e.g., Technology, Finance, Healthcare"
            />
            <InputField
              label="Have you worked at multinational or brand-name firms?"
              field="brandFirms"
              type="radio"
              options={['Yes', 'No']}
            />
            <InputField
              label="Have you held leadership or managerial roles?"
              field="leadership"
              type="radio"
              options={['Yes', 'No']}
            />
            <InputField
              label="Have you received promotions?"
              field="promotions"
              type="radio"
              options={['Yes', 'No']}
            />
            <InputField
              label="Do you have research experience?"
              field="research"
              type="radio"
              options={['Yes', 'No']}
            />
            <InputField
              label="Have you published papers/thesis or presented at conferences?"
              field="publications"
              type="radio"
              options={['Yes', 'No']}
            />
            <InputField
              label="Do you have certifications?"
              field="certifications"
              type="select"
              options={['CFA', 'PMP', 'AWS', 'Data Science', 'Marketing Analytics', 'Other', 'None']}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <InputField
              label="Citizenship"
              field="citizenship"
              placeholder="Enter your country of citizenship"
            />
            <InputField
              label="Gender"
              field="gender"
              type="select"
              options={['Male', 'Female', 'Other', 'Prefer not to say']}
            />
            <InputField
              label="Do you belong to an over-represented demographic group?"
              field="demographicGroup"
              type="radio"
              options={['Yes', 'No']}
            />
            <InputField
              label="Do you have budget constraints?"
              field="budgetConstraints"
              type="radio"
              options={['Yes', 'No']}
            />
            {formData.budgetConstraints === 'Yes' && (
              <InputField
                label="Maximum tuition budget (per year in USD)"
                field="maxBudget"
                type="number"
                placeholder="e.g., 50000"
              />
            )}
            <InputField
              label="Do you require scholarships?"
              field="scholarships"
              type="radio"
              options={['Yes', 'No']}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Brain className="h-12 w-12 text-primary-600 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                University Recommendation Form
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete this comprehensive form to get personalized university recommendations powered by AI
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={`flex items-center ${index < sections.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className={`flex items-center ${index <= currentSection ? 'text-primary-600' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      index <= currentSection ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
                    }`}>
                      {index < currentSection ? (
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      ) : (
                        section.icon
                      )}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <div className="font-semibold">{section.title}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentSection ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-8 md:p-12">
              <div className="flex items-center mb-8">
                {sections[currentSection].icon}
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {sections[currentSection].title}
                  </h2>
                  <p className="text-gray-600">
                    {sections[currentSection].description}
                  </p>
                </div>
              </div>

              {renderSection()}
            </div>

            {/* Navigation */}
            <div className="px-8 py-6 bg-gray-50 rounded-b-2xl flex justify-between">
              <Button
                onClick={prevSection}
                disabled={currentSection === 0}
                variant="outline"
                className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50"
              >
                Previous
              </Button>

              {currentSection === sections.length - 1 ? (
                <Button
                  onClick={generateRecommendations}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Recommendations...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Get My Recommendations
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextSection}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                >
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ImprovedCollegeFinderForm;