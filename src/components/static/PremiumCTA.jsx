import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Calendar, FileText, User, Zap, BarChart3, MessageSquare } from 'lucide-react';

const PremiumCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden ">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-primary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-24 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 bg-primary-300/40 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 left-1/2 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-primary-200/20 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Badge className="bg-primary-700 rounded-full text-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            🎓 Premium Application Service
          </Badge>
          <h2 className="text-2xl sm:text-4xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Apply to Your Dream Universities, With Expert Guidance You Can Trust
           
            <span className="text-primary-700 ml-2">With Expert Guidance</span>
          </h2>
          <p className="text-lg sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:text-center text-justify">
            Do not face the U.S. admissions maze alone. Our expert counselors and real-time
            dashboard guide you step-by-step from shortlist to admit.
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Section - Features */}
          <div className="space-y-6 sm:space-y-8">
            <div className="grid gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Dedicated Mentor Guidance</h3>
                  <p className="text-sm sm:text-base text-gray-600">Learn directly from mentors who have secured
                    admits to top global universities.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Personalized Dashboard</h3>
                  <p className="text-sm sm:text-base text-gray-600"> Track every deadline, document, and interview in one
                    organized space.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">SOP and Essay Review</h3>
                  <p className="text-sm sm:text-base text-gray-600"> Craft a story that stands out with structured feedback from
                    experienced editors and mentors.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Mock Interviews</h3>
                  <p className="text-sm sm:text-base text-gray-600">Prepare with real interview scenarios led by alumni mentors and
                    counselors.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">24×7 Support</h3>
                  <p className="text-sm sm:text-base text-gray-600">Get help whenever you need it. Our team and mentors are always by
                    your side.

                  </p>
                </div>
              </div>
            </div>


            {/* Quick Benefits */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border">
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">What You Get:</h4>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">Application Strategy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">Document Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">Deadline Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">Expert Mentorship</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Dashboard Preview */}
          <div className="relative mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-gradient-to-r from-primary to-primary-600 p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Sarah Johnson</h3>
                    <p className="text-primary-100 text-xs sm:text-sm">Premium Student</p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-primary-100">Your Application Progress</div>
                <div className="text-xl sm:text-2xl font-bold">7/12 Applications Submitted</div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-xs sm:text-sm">Stanford University</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs whitespace-nowrap">Submitted</Badge>
                </div>

                <div className="flex justify-between items-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-xs sm:text-sm">MIT</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs whitespace-nowrap">In Review</Badge>
                </div>

                <div className="flex justify-between items-center p-2 sm:p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-gray-900 text-xs sm:text-sm">UC Berkeley</span>
                  </div>
                  <Badge className="bg-primary-100 text-primary-800 text-xs whitespace-nowrap">Due: Dec 1</Badge>
                </div>

                <div className="text-center pt-3 sm:pt-4">
                  <Button onClick={() => {
                    navigate('/pricing')
                  }} className="bg-primary-800  text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-lg group w-full sm:w-auto">
                    Start Your Premium Journey
                    <ArrowRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  {/* <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-3">Join 2,000+ students who got accepted</p> */}
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -top-3 sm:-top-4 -right-2 sm:-right-4 bg-white rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-4 border">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">98%</div>
                <div className="text-[10px] sm:text-xs text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="absolute -bottom-12 sm:-bottom-16 -left-2 sm:-left-8 bg-white rounded-lg sm:rounded-xl shadow-lg p-2 sm:p-4 border">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-primary-700">200 Crore+</div>
                <div className="text-[10px] sm:text-xs text-gray-600">Scholarships Won</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 sm:mt-12 md:mt-16">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border max-w-4xl mx-auto">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
              Transform Your Applications Today
            </h3>
            {/* <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
              Don't leave your future to chance. Get expert guidance and a personalized dashboard to track every step of your journey.
            </p> */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="default"
                className="bg-primary-800   text-white px-4 cursor-pointer sm:px-8 py-2 sm:py-3 text-lg sm:text-xl w-full sm:w-auto"
                onClick={() => navigate('/pricing')}
              >
                View Plans
              </Button>
              <Button
                size="default"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 cursor-pointer px-4 sm:px-8 py-2 sm:py-3 text-lg sm:text-xl w-full sm:w-auto"
                onClick={() => window.open('https://linktr.ee/goupbroad', '_blank', 'noopener,noreferrer')}
              >
                Book Free Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumCTA;
