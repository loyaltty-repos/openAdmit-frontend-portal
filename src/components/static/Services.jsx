
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Users, BookOpen, CalendarDays, Calculator, TrendingUp, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate()

  const services = [
    {
      icon: Search,
      title: 'Personalized University & Course Search',
      description: 'Discover universities tailored to your strengths, budget, and goals using our AIpowered matching engine.',
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
      features: [' Verified programs', 'Real data', 'No commission bias'],
      badge: 'Popular',
      route: '/university-finder'
    },
    // {
    //   icon: Users,
    //   title: 'Community Forum & Discussion',
    //   description: 'Connect with fellow students, share experiences, and get advice from those who\'ve been there.',
    //   color: 'bg-green-50 text-green-600',
    //   borderColor: 'border-green-200',
    //   features: ['Student networking', 'Experience sharing', 'Peer support'],
    //   badge: 'Active',
    //   route:'/community'
    // },
    // {
    //   icon: BookOpen,
    //   title: 'Scholarship & Funding Finder',
    //   description: 'Access comprehensive scholarship database and find the best funding options including lowest interest loans.',
    //   color: 'bg-purple-50 text-purple-600',
    //   borderColor: 'border-purple-200',
    //   features: ['Scholarship database', 'Loan comparison', 'Funding guidance'],
    //   badge: 'Featured'
    // },
    // {
    //   icon: CalendarDays,
    //   title: 'Application Tracker Dashboard',
    //   description: 'Keep track of all your applications, deadlines, interview dates, and admission rounds in one place.',
    //   color: 'bg-orange-50 text-orange-600',
    //   borderColor: 'border-orange-200',
    //   features: ['Deadline tracking', 'Status updates', 'Interview scheduling'],
    //   badge: 'Essential'
    // },
    {
      icon: Calculator,
      title: 'CGPA TO GPA Converter',
      description: 'Instantly convert your grades to a U.S.-equivalent GPA with accuracy.',
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
      features: ['Understand your eligibility', 'Plan smarter'],
      badge: 'Smart',
      route: '/cgp-to-gpa-converter'
    },
    // {
    //   icon: TrendingUp,
    //   title: 'Career Guidance & Planning',
    //   description: 'Get insights into career prospects, job markets, and post-graduation opportunities in your chosen field.',
    //   color: 'bg-indigo-50 text-indigo-600',
    //   borderColor: 'border-indigo-200',
    //   features: ['Career insights', 'Market analysis', 'Job prospects'],
    //   badge: 'Future-Ready'
    // }
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
          <Badge variant="secondary" className="mb-4 bg-primary-700/20 text-primary-700  rounded-full border-primary-700/20">
            Comprehensive Platform
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            All the Tools You Need to Study Abroad, in One Place.
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-4xl  mx-auto sm:text-center text-justify">
            From finding your ideal university to calculating your GPA and connecting with peers
            abroad, Upbroad gives you everything to plan your U.S. journey confidently.

          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
  {services.map((service, index) => (
    <Card
      key={index}
      className={`group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-md bg-white/80 backdrop-blur-sm hover:bg-white ${service.borderColor} border-l-4 relative overflow-hidden 
        h-full flex flex-col`} // ← Important: flex + h-full
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${service.color.split(' ')[0]}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

      <CardHeader className="relative z-10 flex-grow"> {/* ← flex-grow to push content up */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <service.icon size={24} />
          </div>
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
          {service.title}
        </CardTitle>
        <CardDescription className="text-gray-600 leading-relaxed text-base">
          {service.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 mt-auto"> {/* ← mt-auto pushes button to bottom */}
        <ul className="space-y-3 mb-6 min-h-32"> {/* ← Optional: min-h to ensure consistent spacing */}
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
          className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 text-lg border py-4 "
        >
          <Link to={service.route}>Start Exploring for Free</Link>
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  ))}
</div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary-600 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <h3 className="sm:text-3xl text-xl font-bold text-white mb-4">
               Ready to Begin Your U.S. Study Journey?
              </h3>
              <p className="text-primary-100 mb-6 text-sm sm:text-lg ">
               Upbroad makes studying abroad simpler, transparent, and truly guided.

              </p>
              <Button
                size="lg"
                className="bg-white text-primary-700 w-[300px] sm:w-[250px] hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                onClick={() => {
                  navigate('/signin')
                }}
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;
