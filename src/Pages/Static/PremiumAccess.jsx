import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Calendar, FileText, User, Zap, BarChart3, MessageSquare, Star, Clock, Target } from 'lucide-react';
import Navigation from './components/Navigation';

const PremiumAccess = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 right-10 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary-300/40 rounded-full blur-2xl"></div>
            <div className="absolute top-1/3 left-1/2 w-32 h-32 bg-primary-200/20 rounded-full blur-xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <Badge className="bg-primary text-white px-4 py-2 text-sm font-medium mb-6">
                🎓 Premium Application Service
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Apply to Your Dream Universities
                <br />
                <span className="text-primary">With Expert Guidance</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Don&apos;t navigate the complex application process alone. Our expert counselors will guide you through every step with a personalized dashboard to track your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
                  Get Premium Access - $299/month
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg">
                  Schedule Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600">
                Comprehensive support from application to acceptance
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
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
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary" />
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
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="font-medium text-gray-900">Stanford University</span>
                      </div>
                      <Badge className="bg-primary-100 text-primary-800">Submitted</Badge>
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
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">98%</div>
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

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <Card className="border-primary-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Strategic Planning</h3>
                  <p className="text-gray-600">Customized application strategy based on your profile and target universities.</p>
                </CardContent>
              </Card>

              <Card className="border-primary-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Deadline Management</h3>
                  <p className="text-gray-600">Never miss a deadline with our automated tracking and reminder system.</p>
                </CardContent>
              </Card>

              <Card className="border-primary-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-gray-600">Round-the-clock support from our team of admission experts.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Investment in Your Future
            </h2>
            <Card className="border-primary-200 shadow-xl">
              <CardHeader className="bg-primary text-white">
                <CardTitle className="text-3xl">Premium Package</CardTitle>
                <div className="text-5xl font-bold">$299<span className="text-xl">/month</span></div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Dedicated Expert Counselor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Personalized Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Essay & SOP Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Interview Preparation</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Application Strategy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Document Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Deadline Management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                    Start Your Premium Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-3">
                    Schedule Free Consultation
                  </Button>
                </div>
                <p className="text-gray-500 text-sm mt-4">Join 2,000+ students who got accepted</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600">
                Hear from students who achieved their dreams
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    &quot;The personalized dashboard made tracking my applications so much easier. Got into Stanford!&quot;
                  </p>
                  <div className="font-semibold text-gray-900">- Alex Chen</div>
                  <div className="text-sm text-gray-500">Stanford University</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    &quot;My counselor&apos;s guidance was invaluable. The essay reviews helped me craft compelling stories.&quot;
                  </p>
                  <div className="font-semibold text-gray-900">- Maria Rodriguez</div>
                  <div className="text-sm text-gray-500">MIT</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    &quot;Interview prep sessions boosted my confidence. Couldn&apos;t have done it without the expert support.&quot;
                  </p>
                  <div className="font-semibold text-gray-900">- David Kim</div>
                  <div className="text-sm text-gray-500">Harvard University</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your University Applications?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Don&apos;t leave your future to chance. Get expert guidance and start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-50 px-8 py-4 text-lg font-semibold">
                Get Premium Access - $299/month
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                Schedule Free Consultation
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PremiumAccess;
