
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Globe, Award } from 'lucide-react';

const CTA = () => {
  const highlights = [
    { icon: CheckCircle, text: 'Free Platform Access', color: 'text-green-400' },
    { icon: Users, text: 'Expert Guidance Available', color: 'text-blue-400' },
    { icon: Globe, text: 'Global University Network', color: 'text-purple-400' },
    { icon: Award, text: 'Scholarship Opportunities', color: 'text-yellow-400' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            Join 10,000+ Students Worldwide
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Start Your International Education Journey?
          </h2>
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who have successfully secured admissions and scholarships 
            to top universities worldwide. Your dream education is just one click away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/signin">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300 hover:border-white/50"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {highlights.map((highlight, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <highlight.icon className={`w-6 h-6 ${highlight.color}`} />
                </div>
                <div className="text-white font-semibold text-sm">{highlight.text}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success metrics */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-primary-100 text-sm">Success Rate</div>
                <div className="text-xs text-primary-200 mt-1">Students get admitted</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">$50M+</div>
                <div className="text-primary-100 text-sm">Scholarships Found</div>
                <div className="text-xs text-primary-200 mt-1">Total funding secured</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">25+</div>
                <div className="text-primary-100 text-sm">Countries</div>
                <div className="text-xs text-primary-200 mt-1">Universities available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CTA;
