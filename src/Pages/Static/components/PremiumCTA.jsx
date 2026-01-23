
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Calendar, FileText, User, Zap, BarChart3, MessageSquare } from 'lucide-react';

const PremiumCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden mt-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary-300/40 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 left-1/2 w-32 h-32 bg-primary-200/20 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Badge className="bg-primary text-white px-4 py-2 text-sm font-medium mb-6">
            🎓 Premium Application Service
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Apply to Your Dream Universities
            <br />
            <span className="text-primary">With Expert Guidance</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don&apos;t navigate the complex application process alone. Our expert counselors will guide you through every step with a personalized dashboard to track your progress.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Section - Features */}
          <div className="space-y-8">
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dedicated Expert Counselor</h3>
                  <p className="text-gray-600">Get assigned a personal counselor with 10+ years of experience in university admissions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Dashboard</h3>
                  <p className="text-gray-600">Track application deadlines, document submissions, and interview schedules in real-time.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Essay & SOP Review</h3>
                  <p className="text-gray-600">Professional editing and feedback on your personal statements and essays.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Preparation</h3>
                  <p className="text-gray-600">Mock interviews and personalized feedback to ace your university interviews.</p>
                </div>
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <h4 className="font-semibold text-gray-900 mb-4">What You Get:</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Application Strategy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Document Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Deadline Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah Johnson</h3>
                    <p className="text-primary-100 text-sm">Premium Student</p>
                  </div>
                </div>
                <div className="text-sm text-primary-100">Your Application Progress</div>
                <div className="text-2xl font-bold">7/12 Applications Submitted</div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Stanford University</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">MIT</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">In Review</Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-medium text-gray-900">UC Berkeley</span>
                  </div>
                  <Badge className="bg-primary-100 text-primary-800">Due: Dec 1</Badge>
                </div>

                <div className="text-center pt-4">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold text-lg group">
                    Start Your Premium Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-gray-500 text-sm mt-3">Join 2,000+ students who got accepted</p>
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2M+</div>
                <div className="text-xs text-gray-600">Scholarships Won</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Your University Applications?
            </h3>
            <p className="text-gray-600 mb-6">
              Don&apos;t leave your future to chance. Get expert guidance and a personalized dashboard to track every step of your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 cursor-pointer">
                Pricing Plans
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-3 cursor-pointer">
                Schedule Free Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumCTA;
