
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Globe, Users, Award, GraduationCap, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Circular Gradients Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large primary gradient - top left */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-radial from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Medium secondary gradient - top right */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-radial from-primary-300/40 via-primary-200/20 to-transparent rounded-full blur-2xl"></div>
        
        {/* Small accent gradient - middle left */}
        <div className="absolute top-1/3 -left-20 w-40 h-40 bg-gradient-radial from-primary-400/50 via-primary-300/25 to-transparent rounded-full blur-xl"></div>
        
        {/* Large bottom gradient - bottom right */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-radial from-primary-200/30 via-primary-100/15 to-transparent rounded-full blur-3xl"></div>
        
        {/* Small floating gradient - center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-radial from-primary-500/20 via-primary-400/10 to-transparent rounded-full blur-xl animate-pulse"></div>
        
        {/* Additional small gradients for depth */}
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-radial from-primary-600/25 via-primary-500/12 to-transparent rounded-full blur-lg"></div>
        <div className="absolute top-1/4 right-1/3 w-20 h-20 bg-gradient-radial from-primary-300/35 via-primary-200/18 to-transparent rounded-full blur-md"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Section - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
              🎓 #1 Study Abroad Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Your Gateway to{' '}
              <span className="text-gradient bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                International
              </span>{' '}
              Universities
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Transform your international education dreams into reality. Find the perfect university, 
              secure scholarships, and connect with a global community of ambitious students.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600">Universities</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-gray-600">Students Helped</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signin">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300"
              >
                Explore Universities
              </Button>
            </div>
          </div>

          {/* Right Section - University Campus with Students */}
          <div className="relative flex justify-center">
            {/* Main University Image - Rectangular with Academic Frame */}
            <div className="relative">
              <div className="w-96 h-80 rounded-xl overflow-hidden shadow-2xl border-8 border-white bg-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="University campus with students" 
                  className="w-full h-full object-cover"
                />
                {/* Overlay for university atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
              </div>
              
              {/* Academic Frame Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary-300/20 rounded-2xl -z-10 blur-xl"></div>
            </div>

            {/* Floating Academic Achievement Elements */}
            {/* Top Left - University Ranking */}
            <Card className="absolute -top-4 -left-8 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float">
              <CardContent className="p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-gray-700">Top Ranked</span>
                </div>
                <div className="text-xl font-bold text-primary">98%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </CardContent>
            </Card>

            {/* Top Right - Global Recognition */}
            <Card className="absolute -top-6 -right-8 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <CardContent className="p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700">Global Network</span>
                </div>
                <div className="text-xl font-bold text-primary">25+</div>
                <div className="text-xs text-gray-500">Countries</div>
              </CardContent>
            </Card>

            {/* Middle Left - Academic Programs */}
            <Card className="absolute top-1/3 -left-12 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
              <CardContent className="p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-gray-700">Programs</span>
                </div>
                <div className="text-xl font-bold text-primary">1000+</div>
                <div className="text-xs text-gray-500">Courses Available</div>
              </CardContent>
            </Card>

            {/* Middle Right - Student Community */}
            <Card className="absolute top-1/2 -right-12 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '3s' }}>
              <CardContent className="p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-gray-700">Students</span>
                </div>
                <div className="text-xl font-bold text-primary">50K+</div>
                <div className="text-xs text-gray-500">Active Community</div>
              </CardContent>
            </Card>

            {/* Bottom Left - Scholarships */}
            <Card className="absolute -bottom-4 -left-8 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '4s' }}>
              <CardContent className="p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-700">Scholarships</span>
                </div>
                <div className="text-xl font-bold text-primary">$50M+</div>
                <div className="text-xs text-gray-500">Available Funding</div>
              </CardContent>
            </Card>

            {/* Bottom Right - Graduation Success */}
            <Card className="absolute -bottom-6 -right-8 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '5s' }}>
              <CardContent className="p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-gray-700">Graduates</span>
                </div>
                <div className="text-xl font-bold text-primary">15K+</div>
                <div className="text-xs text-gray-500">Success Stories</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
