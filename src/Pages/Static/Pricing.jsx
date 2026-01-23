
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import { fetchPlans, getPlanDetails } from '@/services/planService';
import { toast } from 'sonner';
import Footer from '@/components/static/Footer';

const Pricing = () => {
  const [selectedCategory, setSelectedCategory] = useState('masters');
  const [plansData, setPlansData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fromAuth = location.state?.fromAuth;
  const userData = location.state?.user;

  useEffect(() => {
    const getPlans = async () => {
      try {
        setLoading(true);
        const data = await fetchPlans();
        setPlansData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    getPlans();
  }, []);

  const handleSelectPlan = (planType, price, category) => {
    navigate('/auth/payment-required', {
      state: {
        planType,
        price,
        category,
        planDetails: getPlanDetails(plansData, planType, category),
        user: userData || null
      }
    });
  };

  const getPlanDetailsForCategory = (planType, category) => {
    return getPlanDetails(plansData, planType, category);
  };

  const basicPlan = !loading && plansData ? getPlanDetailsForCategory('basic', selectedCategory) : { name: 'Basic Plan', price: 0, features: [] };
  const proPlan = !loading && plansData ? getPlanDetailsForCategory('pro', selectedCategory) : { name: 'Pro Plan', price: 0, features: [] };
  const premierPlan = !loading && plansData ? getPlanDetailsForCategory('premier', selectedCategory) : { name: 'Premier Plan', price: 0, features: [] };

  useEffect(() => {
    if (fromAuth && userData) {
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const loadScript = async () => {
        if (!window.Razorpay) {
          const res = await loadRazorpayScript();
          if (!res) {
            toast.error('Razorpay SDK failed to load. Please check your internet connection.');
          }
        }
      };

      loadScript();
    }
  }, [fromAuth, userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navigation />
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Loading plans...</h2>
          <p className="text-gray-600">Please wait while we fetch the latest pricing information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navigation />
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Plans</h2>
          <p className="text-gray-600 mb-4">We encountered an error while loading the pricing plans.</p>
          <Button
            className="bg-[#145044] hover:bg-[#145044]/90 text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EC]">
      <Navigation />

      {fromAuth && userData && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-4 sm:mx-auto sm:max-w-7xl mt-20 sm:mt-24 mb-0 text-sm sm:text-base">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 leading-relaxed">
              <span className="font-bold">Payment Required:</span> Please select a plan to complete your registration and access all features.
            </p>
          </div>
        </div>
      )}

      <main className={fromAuth && userData ? 'pt-6 sm:pt-8' : 'pt-16 sm:pt-24'}>
        {/* Hero Section - Mobile Optimized */}
        <section className="py-12 sm:py-20 bg-[#F7EFD8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="bg-primary text-white px-4 py-2 text-xs sm:text-sm font-medium mb-5">
              Choose Your Plan
            </Badge>
            <h1 className="text-2xl sm:text-5xl md:text-5xl font-bold text-gray-900 leading-tight">
              Choose the Right Support for Your
              <br className="hidden sm:block" />
              <span className="ml-2 mt-2 text-primary">Study Abroad Journey</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-primary max-w-3xl mx-auto mt-6 leading-relaxed px-2 text-justify sm:text-center">
              Explore personalized services designed to help you find the right universities, craft strong applications, and study abroad with confidence.
            </p>

            {/* Category Tabs - Mobile Friendly */}
            <div className="flex flex-wrap justify-center gap-3 mt-10 mb-8">
              {['masters', 'bachelors', 'mba'].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-sm sm:text-base px-6 py-5 rounded-full transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary hover:bg-[#145044]/90'
                      : 'border-[#145044] text-[#145044] hover:bg-[#145044]/10'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans - Fully Mobile Responsive */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Basic Plan */}
              <Card className="border-2 border-gray-200 hover:border-[#145044]/30 transition-all duration-300">
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">{basicPlan.name}</CardTitle>
                  <div className="mt-5">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">₹{basicPlan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 text-sm block mt-1">/ one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-8">
                  <div className="space-y-4">
                    {basicPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm sm:text-base">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-primary cursor-pointer text-white py-6 text-base sm:text-lg rounded-xl"
                    size="lg"
                    onClick={() => handleSelectPlan('basic', basicPlan.price, selectedCategory)}
                  >
                    Choose Basic
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan - Highlighted */}
              <Card className="border-4 border-primary relative transform scale-100 sm:scale-105 shadow-2xl z-10">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-5 py-2 text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-6 pt-10">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">{proPlan.name}</CardTitle>
                  <div className="mt-5">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">₹{proPlan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 text-sm block mt-1">/ one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-8">
                  <div className="space-y-4">
                    {proPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm sm:text-base">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-primary cursor-pointer text-white py-6 text-base sm:text-lg rounded-xl shadow-lg"
                    size="lg"
                    onClick={() => handleSelectPlan('pro', proPlan.price, selectedCategory)}
                  >
                    Choose Pro
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>

              {/* Premier Plan */}
              <Card className="border-2 border-gray-200 hover:border-[#145044]/30 transition-all duration-300">
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">{premierPlan.name}</CardTitle>
                  <div className="mt-5">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">₹{premierPlan.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 text-sm block mt-1">/ one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-8">
                  <div className="space-y-4">
                    {premierPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm sm:text-base">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-primary cursor-pointer  text-white py-6 text-base sm:text-lg rounded-xl"
                    size="lg"
                    onClick={() => handleSelectPlan('premier', premierPlan.price, selectedCategory)}
                  >
                    Choose Premier
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Add-Ons Card */}
            <div className="px-4">
              <Card className="max-w-2xl mx-auto border-2 border-orange-300 bg-orange-50/80 shadow-lg">
                <CardContent className="p-6 sm:p-8 text-justify">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Add-Ons</h3>
                  <div className="text-2xl sm:text-3xl font-bold mb-5 text-primary">₹7,000 / university</div>
                  <div className="space-y-4 text-sm sm:text-base text-gray-700">
                    <div className="flex items-start gap-3 justify-center">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>If you plan to apply to additional universities beyond those included in your plan.</span>
                    </div>
                    <div className="flex items-start gap-3 justify-center">
                      <CheckCircle className="w-5 h-5 text-[#145044] flex-shrink-0 mt-0.5" />
                      <span>Includes full document preparation and review for each extra university.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 sm:py-20 bg-[#FBF7EC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-10">Why Choose Open Admits?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { title: "Expert Guidance", desc: "Our experienced counselors have helped thousands of students achieve their dreams" },
                { title: "Proven Success", desc: "95% of our students get accepted into their preferred universities" },
                { title: "End-to-End Support", desc: "From application to visa, we're with you every step of the way" }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center">
                    {i === 0 && <CheckCircle className="w-8 h-8 text-white" />}
                    {i === 1 && <Star className="w-8 h-8 text-white" />}
                    {i === 2 && <ArrowRight className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base px-4 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
