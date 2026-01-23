
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, BookOpen, CalendarDays, Calculator, TrendingUp, ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Search,
      title: 'Personalized University & Course Search',
      description: 'Find your perfect match with our AI-powered search that considers your strengths, weaknesses, and preferences.',
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
      features: ['AI-powered matching', 'Detailed course insights', 'Admission requirements'],
      badge: 'Popular'
    },
    {
      icon: Users,
      title: 'Community Forum & Discussion',
      description: 'Connect with fellow students, share experiences, and get advice from those who\'ve been there.',
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
      features: ['Student networking', 'Experience sharing', 'Peer support'],
      badge: 'Active'
    },
    {
      icon: BookOpen,
      title: 'Scholarship & Funding Finder',
      description: 'Access comprehensive scholarship database and find the best funding options including lowest interest loans.',
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
      features: ['Scholarship database', 'Loan comparison', 'Funding guidance'],
      badge: 'Featured'
    },
    {
      icon: CalendarDays,
      title: 'Application Tracker Dashboard',
      description: 'Keep track of all your applications, deadlines, interview dates, and admission rounds in one place.',
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200',
      features: ['Deadline tracking', 'Status updates', 'Interview scheduling'],
      badge: 'Essential'
    },
    {
      icon: Calculator,
      title: 'Test Score Calculator & Eligibility',
      description: 'Check your eligibility and calculate required scores for IELTS, GMAT, GRE, and other standardized tests.',
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
      features: ['Score calculation', 'Eligibility check', 'Test preparation'],
      badge: 'Smart'
    },
    {
      icon: TrendingUp,
      title: 'Career Guidance & Planning',
      description: 'Get insights into career prospects, job markets, and post-graduation opportunities in your chosen field.',
      color: 'bg-indigo-50 text-indigo-600',
      borderColor: 'border-indigo-200',
      features: ['Career insights', 'Market analysis', 'Job prospects'],
      badge: 'Future-Ready'
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-500/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/5 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Comprehensive Platform
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Study Abroad Success
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and resources you need to make informed decisions 
            about your international education journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-md bg-white/80 backdrop-blur-sm hover:bg-white ${service.borderColor} border-l-4 relative overflow-hidden`}
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 ${service.color.split(' ')[0]}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon size={24} />
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {service.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary to-primary-600 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-primary-100 mb-6">
                Get access to all these features and more with our comprehensive platform.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-3 font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;
