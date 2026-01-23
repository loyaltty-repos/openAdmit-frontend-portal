
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BookOpen,
  Target,
  Globe,
  Sparkles,
  Brain,
  GraduationCap,
  Loader2,
} from 'lucide-react';

const CACHE_KEY_PREFIX = 'college_finder_cache_';

const NewCollegeFinder = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [hasExistingResults, setHasExistingResults] = useState(false);

  const detectExistingResults = () => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(CACHE_KEY_PREFIX)) continue;

        const raw = localStorage.getItem(key);
        if (!raw) continue;

        let cached;
        try {
          cached = JSON.parse(raw);
        } catch {
          continue;
        }

        const recs = cached.recommendations || {};
        const hasData =
          Array.isArray(recs.ambitious) && recs.ambitious.length > 0 ||
          Array.isArray(recs.target) && recs.target.length > 0 ||
          Array.isArray(recs.safe) && recs.safe.length > 0 ||
          Array.isArray(recs.backup) && recs.backup.length > 0;

        if (hasData) return true;
      }
    } catch (err) {
      console.warn('Error checking cache:', err);
    }
    return false;
  };

  useEffect(() => {
    const hasCache = detectExistingResults();
    setHasExistingResults(hasCache);

    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartJourney = () => {
    setIsLoading(true);
    if (hasExistingResults) {
      navigate('/university-finder/results');
    } else {
      setTimeout(() => {
        navigate('/university-finder/questionnaire');
      }, 800);
    }
  };

  const features = [
    { icon: <Brain className="h-8 w-8 text-primary-600" />, title: "AI-Powered Matching", description: "Advanced algorithms analyze your profile to find perfect university matches" },
    { icon: <Target className="h-8 w-8 text-primary-600" />, title: "Personalized Recommendations", description: "Get tailored suggestions based on your academic background and goals" },
    { icon: <Globe className="h-8 w-8 text-primary-600" />, title: "Comprehensive Database", description: "Access to 500+ universities with real-time admission requirements" },
    { icon: <GraduationCap className="h-8 w-8 text-primary-600" />, title: "Success Probability", description: "Know your chances with our sophisticated probability calculator" },
  ];

  const stats = [
    { number: "10,000+", label: "Students Guided" },
    { number: "500+", label: "Universities" },
    { number: "95%", label: "Success Rate" },
    { number: "50+", label: "Countries" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      {/* Hero Section - Mobile First */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 sm:w-80 sm:h-80 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 bg-primary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-64 sm:h-64 bg-primary-100/40 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative text-center">
          <div className={`transform transition-all duration-1000 ease-out ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex flex-col items-center mb-6 gap-3">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary-600 animate-pulse" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-tight text-center">
                <span className="text-gray-900">Let </span>
                <span className="text-primary-600">Goupbroad</span>
              
                <span className="text-gray-900"> Guide You</span>
              </h1>
            </div>

            <h2 className="text-xl sm:text-3xl md:text-3xl font-semibold text-gray-700 mt-6 sm:mt-8">
              Find the <span className="text-primary-600 relative inline-block">
                Perfect University
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"></div>
              </span> for You
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
              {hasExistingResults
                ? "Welcome back! Your personalized university recommendations are ready to view."
                : "Discover your ideal university match with our AI-powered recommendation engine. Get personalized suggestions based on your academic profile, preferences, and career goals."}
            </p>
          </div>

          <div className={`transform transition-all duration-1000 delay-300 ease-out mt-10 ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Button
              onClick={handleStartJourney}
              disabled={isLoading}
              size="lg"
              className="w-full max-w-md sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-10 py-7 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary-500/25 transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center mx-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  Loading...
                </>
              ) : hasExistingResults ? (
                <>
                  <Sparkles className="h-6 w-6 mr-3" />
                  View Your Results Again
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  <BookOpen className="h-6 w-6 mr-3" />
                  Start Your University Journey
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className={`text-center transform transition-all duration-700 delay-${i * 100} ${animationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our University Finder?
            </h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Our advanced AI technology and comprehensive database ensure you find the perfect university match for your unique profile and aspirations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-primary-200 text-center"
              >
                <div className="mb-5 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-base sm:text-lg text-gray-600">Simple steps to find your perfect university match</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((step) => (
              <div key={step} className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover:scale-110 transition-transform">
                  {step}
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {step === 1 && "Share Your Profile"}
                  {step === 2 && "AI Analysis"}
                  {step === 3 && "Get Recommendations"}
                </h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-4">
                  {step === 1 && "Tell us about your academic background, test scores, and preferences through our smart questionnaire."}
                  {step === 2 && "Our advanced AI analyzes your profile against thousands of university programs and admission requirements."}
                  {step === 3 && "Receive personalized university recommendations with admission probability and detailed insights."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Ready to Find Your Dream University?
          </h3>
          <p className="text-base sm:text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect university match with our AI-powered platform.
          </p>
          <Button
            onClick={handleStartJourney}
            disabled={isLoading}
            size="lg"
            className="w-full max-w-md sm:w-auto bg-white text-primary-600 hover:bg-gray-100 px-10 py-7 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all mx-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mr-3" />
                Loading...
              </>
            ) : hasExistingResults ? (
              "View Your Results Now"
            ) : (
              "Start Finding Universities Now"
            )}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewCollegeFinder;
