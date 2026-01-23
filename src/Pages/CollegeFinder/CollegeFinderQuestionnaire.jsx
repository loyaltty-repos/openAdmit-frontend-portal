import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navigation from '@/components/static/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, BookOpen, CheckCircle, Brain, Sparkles } from 'lucide-react';
import collegeData from '@/data/collegeData';

const CollegeFinderQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Question flow based on your logic document
  const questions = [
    {
      id: 'program',
      text: 'Which program do you want to apply for?',
      type: 'select',
      options: ['MSCS', 'MBA', 'MS Finance', 'MS Marketing', 'MS Data Science', 'Engineering', 'MS Business Analytics'],
      required: true
    },
    {
      id: 'intakeMode',
      text: 'Do you want Base Questions (short intake) or Advanced Questions (detailed intake)?',
      type: 'select',
      options: ['Base Questions', 'Advanced Questions'],
      required: true
    },
    {
      id: 'stemRequired',
      text: 'Do you require only STEM-designated programs?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'f1Required',
      text: 'Do you require only F-1 visa eligible programs?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'gpa',
      text: 'What is your undergraduate GPA?',
      type: 'number',
      placeholder: 'Enter your GPA (e.g., 3.5)',
      min: 0,
      max: 4,
      step: 0.01,
      required: true
    },
    {
      id: 'gpaScale',
      text: 'What is the scale of your GPA?',
      type: 'select',
      options: ['4.0', '10.0', 'Percentage'],
      required: true
    },
    {
      id: 'university',
      text: 'What is the name of your undergraduate university?',
      type: 'text',
      placeholder: 'Enter your university name',
      required: true
    },
    {
      id: 'universityTier',
      text: 'What is the tier of your university?',
      type: 'select',
      options: ['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3'],
      required: true
    },
    {
      id: 'degree',
      text: 'What is the name of your undergraduate degree?',
      type: 'text',
      placeholder: 'e.g., Computer Science Engineering',
      required: true
    },
    {
      id: 'mathProgrammingStats',
      text: 'Did your degree include Mathematics, Programming, and Statistics coursework?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true,
      condition: (responses) => responses.program === 'MSCS' || responses.program === 'MS Data Science'
    },
    {
      id: 'degreeLength',
      text: 'Was your undergraduate program 3 years or 4 years?',
      type: 'select',
      options: ['3 years', '4 years'],
      required: true
    },
    {
      id: 'mastersDegree',
      text: 'Have you completed any master\'s degree?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'testType',
      text: 'Which standardized test did you take?',
      type: 'select',
      options: ['GRE', 'GMAT', 'Both', 'None'],
      required: true
    },
    {
      id: 'greTotal',
      text: 'What is your GRE total score?',
      type: 'number',
      placeholder: 'Enter total score (260-340)',
      min: 260,
      max: 340,
      required: true,
      condition: (responses) => responses.testType === 'GRE' || responses.testType === 'Both'
    },
    {
      id: 'greQuant',
      text: 'What is your GRE Quantitative score?',
      type: 'number',
      placeholder: 'Enter Quant score (130-170)',
      min: 130,
      max: 170,
      required: true,
      condition: (responses) => responses.testType === 'GRE' || responses.testType === 'Both'
    },
    {
      id: 'greVerbal',
      text: 'What is your GRE Verbal score?',
      type: 'number',
      placeholder: 'Enter Verbal score (130-170)',
      min: 130,
      max: 170,
      required: true,
      condition: (responses) => responses.testType === 'GRE' || responses.testType === 'Both'
    },
    {
      id: 'gmatTotal',
      text: 'What is your GMAT total score?',
      type: 'number',
      placeholder: 'Enter total score (200-800)',
      min: 200,
      max: 800,
      required: true,
      condition: (responses) => responses.testType === 'GMAT' || responses.testType === 'Both'
    },
    {
      id: 'englishTest',
      text: 'Which English test did you take?',
      type: 'select',
      options: ['TOEFL', 'IELTS', 'Duolingo'],
      required: true
    },
    {
      id: 'englishScore',
      text: 'What is your English test score?',
      type: 'number',
      placeholder: 'Enter your score',
      required: true
    },
    {
      id: 'intakeYear',
      text: 'What is your intended intake year?',
      type: 'select',
      options: ['2024', '2025', '2026'],
      required: true
    },
    {
      id: 'intakeSeason',
      text: 'What is your intended intake season?',
      type: 'select',
      options: ['Fall', 'Spring', 'Summer'],
      required: true
    }
  ];

  // Advanced questions (shown if user selects "Advanced Questions")
  const advancedQuestions = [
    {
      id: 'workExperience',
      text: 'How many years of full-time work experience do you have?',
      type: 'number',
      placeholder: 'Enter years of experience',
      min: 0,
      max: 20,
      required: true
    },
    {
      id: 'industries',
      text: 'Which industries have you worked in?',
      type: 'text',
      placeholder: 'e.g., Technology, Finance, Healthcare',
      required: true
    },
    {
      id: 'brandFirms',
      text: 'Have you worked at multinational or brand-name firms?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'leadership',
      text: 'Have you held leadership or managerial roles?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'research',
      text: 'Do you have research experience?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'publications',
      text: 'Have you published papers/thesis or presented at conferences?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'certifications',
      text: 'Do you have certifications?',
      type: 'select',
      options: ['CFA', 'PMP', 'AWS', 'Data Science', 'Marketing Analytics', 'Other', 'None'],
      required: true
    },
    {
      id: 'citizenship',
      text: 'What is your citizenship?',
      type: 'text',
      placeholder: 'Enter your country of citizenship',
      required: true
    },
    {
      id: 'budgetConstraints',
      text: 'Do you have budget constraints?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'maxBudget',
      text: 'What is your maximum tuition budget (per year)?',
      type: 'number',
      placeholder: 'Enter amount in USD',
      required: true,
      condition: (responses) => responses.budgetConstraints === 'Yes'
    }
  ];

  // Get current question set
  const getAllQuestions = () => {
    let allQuestions = [...questions];
    if (responses.intakeMode === 'Advanced Questions') {
      allQuestions = [...allQuestions, ...advancedQuestions];
    }
    return allQuestions.filter(q => !q.condition || q.condition(responses));
  };

  const currentQuestions = getAllQuestions();
  const currentQ = currentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;

  const handleAnswer = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);

    try {
      // Filter colleges based on responses
      let filteredColleges = [...collegeData];

      // Apply filters
      if (responses.program) {
        filteredColleges = filteredColleges.filter(college =>
          college.programType === responses.program ||
          (responses.program === 'Engineering' && college.programType === 'Engineering')
        );
      }

      if (responses.stemRequired === 'Yes') {
        filteredColleges = filteredColleges.filter(college => college.stemDesignated);
      }

      if (responses.f1Required === 'Yes') {
        filteredColleges = filteredColleges.filter(college => college.f1Eligible);
      }

      if (responses.degreeLength === '3 years') {
        filteredColleges = filteredColleges.filter(college => college.accepts3Year);
      }

      if (responses.englishTest === 'Duolingo') {
        filteredColleges = filteredColleges.filter(college => college.acceptsDuolingo);
      }

      // Score and categorize colleges
      const scoredColleges = filteredColleges.map(college => {
        let score = 0;
        let probability = 0;

        // GPA scoring
        const normalizedGPA = normalizeGPA(responses.gpa, responses.gpaScale);
        if (normalizedGPA >= college.gpaRequirement) {
          score += 250;
        } else {
          score += (normalizedGPA / college.gpaRequirement) * 200;
        }

        // Test score scoring
        if (responses.greTotal && college.greRequirement) {
          if (responses.greTotal >= college.greRequirement) {
            score += 300;
          } else {
            score += (responses.greTotal / college.greRequirement) * 250;
          }
        }

        if (responses.gmatTotal && college.gmatRequirement) {
          if (responses.gmatTotal >= college.gmatRequirement) {
            score += 300;
          } else {
            score += (responses.gmatTotal / college.gmatRequirement) * 250;
          }
        }

        // Calculate probability based on score
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

        return {
          ...college,
          score,
          probability: Math.round(probability),
          tier
        };
      });

      // Sort by probability and distribute across tiers
      const sortedColleges = scoredColleges.sort((a, b) => b.probability - a.probability);

      // Group by tiers
      const ambitious = sortedColleges.filter(c => c.tier === 'ambitious').slice(0, 5);
      const target = sortedColleges.filter(c => c.tier === 'target').slice(0, 5);
      const safe = sortedColleges.filter(c => c.tier === 'safe').slice(0, 5);
      const backup = sortedColleges.filter(c => c.tier === 'backup').slice(0, 5);

      setRecommendations({
        ambitious,
        target,
        safe,
        backup,
        total: ambitious.length + target.length + safe.length + backup.length
      });

      setShowResults(true);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeGPA = (gpa, scale) => {
    if (scale === '4.0') return parseFloat(gpa);
    if (scale === '10.0') return (parseFloat(gpa) / 10) * 4;
    if (scale === 'Percentage') return (parseFloat(gpa) / 100) * 4;
    return parseFloat(gpa);
  };

  const isAnswered = () => {
    return responses[currentQ?.id] !== undefined && responses[currentQ?.id] !== '';
  };

  if (showResults) {
    navigate('/university-finder/results', { state: { recommendations, responses } });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Brain className="h-20 w-20 text-primary-600 mx-auto mb-6 animate-pulse" />
            <Sparkles className="h-8 w-8 text-primary-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            AI is Analyzing Your Profile
          </h2>
          <p className="text-gray-600 mb-8">
            Finding the perfect university matches for you...
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {currentQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="flex items-start mb-8">
              <BookOpen className="h-8 w-8 text-primary-600 mr-4 mt-1 flex-shrink-0" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {currentQ.text}
              </h2>
            </div>

            {/* Answer Input */}
            <div className="mb-8">
              {currentQ.type === 'select' && (
                <div className="grid gap-3">
                  {currentQ.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`p-4 text-left rounded-xl border-2 transition-all duration-200 hover:border-primary-300 ${
                        responses[currentQ.id] === option
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {responses[currentQ.id] === option && (
                          <CheckCircle className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'radio' && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQ.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`p-6 text-center rounded-xl border-2 transition-all duration-200 hover:border-primary-300 ${
                        responses[currentQ.id] === option
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-semibold text-lg">{option}</span>
                      {responses[currentQ.id] === option && (
                        <CheckCircle className="h-6 w-6 text-primary-600 mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {(currentQ.type === 'text' || currentQ.type === 'number') && (
                <input
                  type={currentQ.type}
                  placeholder={currentQ.placeholder}
                  min={currentQ.min}
                  max={currentQ.max}
                  step={currentQ.step}
                  value={responses[currentQ.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                variant="outline"
                className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>

              <Button
                onClick={nextQuestion}
                disabled={!isAnswered()}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === currentQuestions.length - 1 ? (
                  <>
                    Generate Recommendations
                    <Sparkles className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeFinderQuestionnaire;