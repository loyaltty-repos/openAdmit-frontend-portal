
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Globe, Users, Award, GraduationCap, Star, School } from 'lucide-react';
import { FaUserGraduate } from "react-icons/fa";
import Heroimg from '@/assets/heroimg.jpg';
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
      {/* Circular Gradients Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large primary gradient - top left */}
        <div className="absolute -top-10 -left-20 w-30 h-30 bg-primary-600 rounded-full blur-3xl"></div>

        {/* Medium secondary gradient - top right */}
        <div className="absolute -top-10 -right-10 w-30 h-30 bg-primary-600 rounded-full blur-3xl"></div>

        {/* Small accent gradient - middle left */}
        <div s style={{
          backgroundImage: 'radial-gradient(circle, #58BCA880, #88D3C440, #88D3C400)'
        }} className="absolute  top-1/2 -left-20 w-40 h-40 rounded-full blur-sm"></div>

        {/* Large bottom gradient - bottom right */}
        {/* <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-600 rounded-full blur-3xl"></div> */}

        {/* Small floating gradient - center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 w-20 h-20 bg-primary-600 rounded-full blur-3xl animate-pulse"></div>

        {/* Additional small gradients for depth */}
        <div style={{
          backgroundImage: 'radial-gradient(circle, #58BCA880, #88D3C440, #88D3C400)'
        }} className="absolute bottom-1/4 left-1/4 w-20 h-20  rounded-full blur-sm"></div>
        <div style={{
          backgroundImage: 'radial-gradient(circle, #58BCA880, #88D3C440, #88D3C400)'
        }} className="absolute top-1/4 right-1/3 w-20 h-20  rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-md:gap-12 items-center">

          {/* Left Section - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="bg-primary-1/10 text-primary border-primary/20 px-4 py-2 text-sm">
              🎓 #1 Study Abroad Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-5xl font-bold text-gray-900 leading-tight">
              Admissions Led by Those {' '}
              <span className="text-gradient bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                Who’ve Done It.
              </span>{' '}

            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed text-justify">
              No partner universities. No hidden agendas. Just honest
              guidance to the best university for you.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">150+</div>
                  <div className="text-base text-gray-600">Universities</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">1K+</div>
                  <div className="text-base text-gray-600">Students Helped</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center sm:justify-start gap-4">

              <Button
                size="lg"
                className="bg-primary-1 hover:bg-primary-1-700 w-[300px] cursor-pointer sm:w-[250px] text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                onClick={() => window.open('https://linktr.ee/goupbroad', '_blank', 'noopener,noreferrer')}

              >
                Book a Consultation
                {/* <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /> */}
              </Button>

              <Link to="/university-finder">
                <Button
                  // variant="outline"
                  size="lg"
                  className="border-primary border bg-white text-primary hover:bg-primary-1 w-[300px] cursor-pointer sm:w-[250px] hover:text-white px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  Explore Universities
                </Button></Link>
            </div>
          </div>

          {/* Right Section - University Campus with Students */}
          <div className="relative flex justify-center items-center max-lg:h-[350px] max-sm:h-[300px] max-lg:mx-[60px] max-sm:mx-[40px] max-lg:mt-10 pb-10">
            {/* Main University Image - Rectangular with Academic Frame */}
            <div className="relative">
              <div className="w-96 h-96 max-sm:w-60 max-sm:h-60 max-lg:w-72 max-lg:h-72 shadow-2xl  -ml-2  rounded-full overflow-hidden  border-8 border-white bg-white     ">
                <img
                  // src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  src={Heroimg}
                  alt="University campus with students"
                  className="w-full h-full object-cover  "
                />
                {/* Overlay for university atmosphere */}
                
              </div>

              {/* Academic Frame Effect */}
              {/* <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary-300/20 rounded-2xl -z-10 blur-xl"></div> */}
            </div>

            {/* Floating Academic Achievement Elements */}
            {/* Top Left - University Ranking */}
            <Card className="absolute -top-4 -left-6 max-sm:p-3 max-w-48 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float">
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center justify-center gap-2 mb-1 ">
                  <GraduationCap className="w-4 h-4 text-yellow-500 " />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700 ">Success Rate</span>
                </div>
                <div className="text-xl max-sm:text-[14px] font-bold text-primary-800">100%</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500 hidden md:block">Students who got admitted</div>
              </CardContent>
            </Card>

            {/* Top Right - Global Recognition */}
            <Card className="absolute sm:-top-6 sm:-right-4 -top-3 -right-4  max-sm:p-3 max-w-48 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Global Network</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">Alumni in 10+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500 ">Countries</div>
              </CardContent>
            </Card>

            {/* Middle Left - Academic Programs */}
            <Card className="absolute top-1/3 -left-12 max-sm:p-3 sm:max-w-48 max-w-30 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700 ">Scholarships Secured</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">200 Crore+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500 hidden md:block">Real funding, verified  outcomes</div>
              </CardContent>
            </Card>

            {/* Middle Right - Student Community */}
            <Card className="absolute top-1/3 -right-12 max-w-48 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '3s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <School className="w-4 h-4 text-purple-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Universities</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">150+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500 hidden md:block">Curated and verified by  our experts</div>
              </CardContent>
            </Card>

            {/* Bottom Left - Scholarships */}
            <Card className="absolute -bottom-16 max-lg:bottom-1 max-sm:bottom-2 max-w-48 sm:left-48 left-22 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '4s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FaUserGraduate className="w-4 h-4 text-orange-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Graduates</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">400+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500 hidden md:block">Success stories from our growing community</div>
              </CardContent>
            </Card>

            {/* Bottom Right - Graduation Success */}
            {/* <Card className="absolute -bottom-6 max-lg:bottom-1 max-sm:bottom-5 -right-4 max-sm:p-3 bg-white/95 backdrop-blur-sm border-0 shadow-lg animate-float" style={{ animationDelay: '5s' }}>
              <CardContent className=" text-center max-sm:px-0">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs max-sm:text-[10px] font-semibold text-gray-700">Graduates</span>
                </div>
                <div className="text-xl  max-sm:text-[14px] font-bold text-primary-800">15K+</div>
                <div className="text-xs max-sm:text-[10px] text-gray-500">Success Stories</div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
