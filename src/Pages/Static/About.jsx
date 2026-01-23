
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, Award, University, Globe, Heart, Target, Lightbulb, CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react';
import Navigation from './components/Navigation';
import { Link, useNavigate } from 'react-router-dom';
import CTA from '@/components/static/CTA';
import Footer from '@/components/static/Footer';

const About = () => {
  console.log('About component rendering');
  const navigate = useNavigate()

  const impactStats = [
    { number: '1k+', label: 'Students Helped', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { number: '500+', label: 'Mentors', icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
    { number: '200 Crores', label: 'Scholarships Secured', icon: Award, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { number: '100%', label: 'Student Success Rate', icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-50' }
  ];

  const values = [
    { title: 'Student-Centric', description: 'We prioritize our students\' dreams and aspirations above all else.', icon: Heart, gradient: 'from-red-400 to-pink-400' },
    { title: 'Transparency', description: 'Complete transparency in processes, fees, and guidance.', icon: Lightbulb, gradient: 'from-yellow-400 to-orange-400' },
    { title: 'Excellence', description: 'Committed to excellence in every aspect of service delivery.', icon: Award, gradient: 'from-blue-400 to-indigo-400' },
    { title: 'Innovation', description: 'Continuously evolving with latest technology and practices.', icon: Target, gradient: 'from-green-400 to-teal-400' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section - Fully Mobile Responsive */}
      <section className="pt-20 pb-12 lg:pt-24 lg:pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
              <Badge variant="outline" className="border-primary-700 text-primary-700 rounded-full px-3 py-1 text-sm">
                About Goupbroad
              </Badge>

              <h1 className="text-2xl sm:text-4xl lg:text-4xl font-bold text-gray-900 leading-tight">
                100% Unbiased Admissions Guidance. No Tie-Ups. No Agendas.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                At Upbroad, we guide you to the best-fit university for you—
                not the ones consultants are paid to promote. We have zero
                partner universities, ensuring our recommendations are 100%
                unbiased.
              </p>

              {/* Mobile Stats */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 py-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">1k+</div>
                  <div className="text-sm text-gray-600">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-gray-600">Students Success Rate </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 ">
                <Link to="/signin" className="flex flex-col sm:flex-row gap-4 ">
                  <Button className="bg-primary hover:bg-primary/90 cursor-pointer text-white px-6 py-5 text-base sm:text-lg rounded-lg flex items-center">
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative order-1 lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students collaborating and studying together"
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
              />

              <Card className="absolute bottom-2 right-4 sm:bottom-6 sm:right-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg w-auto sm:w-auto">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">500+</div>
                      <div className="text-xs text-gray-600">Mentors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics - Mobile Optimized */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Our Impact</h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">Transforming lives through education, one student at a time</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-5 sm:p-6">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story - Mobile First */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-5 order-2 lg:order-1">
              <Badge variant="outline" className="mb-3 border-primary-700 rounded-full text-primary-700 text-sm">Our Story</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">We Were Misled. Now We Lead—1,000+ Students,
                ₹200 Cr+ Scholarships.</h2>
              <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                <p>
                  What began as our response to being misled by consultancies has
                  grown into a mission to support students transparently. Today,
                  we’ve guided 1,000+ students to over ₹200 crore in scholarships
                  and admits to institutions like Harvard, Wharton, Columbia, MIT,
                  and Northwestern.
                </p>
                {/* <p>
                  With a team of experienced counselors and a network spanning across the globe,
                  we continue to innovate and evolve our services to meet the changing landscape of international education.
                </p> */}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3"
                alt="Team collaboration"
                className="rounded-lg shadow-lg w-full h-64 sm:h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Founders - Mobile Tabs Fix */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-primary-700 text-primary-700 rounded-full text-sm">Leadership</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Our Founders</h2>
            <p className="text-base text-gray-600">Meet the visionaries behind Goupbroad</p>
          </div>

          <Tabs defaultValue="anushk" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-6 text-sm sm:text-base">
              <TabsTrigger value="anushk" className="cursor-pointer">Anushk Sharma</TabsTrigger>
              <TabsTrigger value="shrey" className="cursor-pointer">Shrey Choksi</TabsTrigger>
            </TabsList>

            <TabsContent value="anushk" className="mt-4">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 sm:p-8 bg-white order-2 lg:order-1">
                    <div className="flex items-center mb-5">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <GraduationCap className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Anushk Sharma</h3>
                        <p className="text-primary font-medium">Co-Founder & CEO</p>
                      </div>
                    </div>
                    <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed text-justify">
                      <p>Anushk completed his bachelor’s from a Tier-3 university in India
                        and was misled by multiple consultancies, which led him to
                        handle his master’s applications himself. He secured admits from
                        Kellogg, Columbia, and Notre Dame, ultimately choosing Notre
                        Dame with a substantial scholarship. Today, he also creates
                        content focused on immigrant journeys and life in the U.S.</p>
                      {/* <p>In his quest for admission, Anushk sought assistance from a &quot;reputed local consultancy service in Indore&quot;...</p> */}
                    </div>
                    <div className="mt-5 flex flex-col gap-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">University of Notre Dame</Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs sm:text-sm">Master’s in Management</Badge>
                    </div>
                  </div>
                  <div className=" p-8 flex items-center justify-center order-1 lg:order-2">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face"
                      alt="Anushk Sharma"
                      className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="shrey" className="mt-4">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 sm:p-8 bg-white order-2 lg:order-1">
                    <div className="flex items-center mb-5">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <Globe className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Shrey Choksi</h3>
                        <p className="text-primary font-medium">Co-Founder & CTO</p>
                      </div>
                    </div>
                    <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed text-justify">
                      <p>Shrey completed his bachelor’s in Electronics and
                        Communication Engineering and decided to pursue a master’s
                        in the U.S. After facing a poor experience with Indian
                        consultancies, he handled the entire application process
                        himself and secured admits from UC Berkeley, UMass Amherst,
                        and Florida State University—with a full tuition waiver. He
                        ultimately chose Florida State University.</p>
                      {/* <p>Like many students, Shrey initially sought help from traditional agencies...</p> */}
                    </div>
                    <div className="mt-5 flex flex-col gap-2">
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs sm:text-sm">Florida State University</Badge>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-700 text-xs sm:text-sm">Computer Science</Badge>
                    </div>
                  </div>
                  <div className=" p-8 flex items-center justify-center order-1 lg:order-2">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=300&h=300&fit=crop&crop=face"
                      alt="Shrey Choksi"
                      className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Our Values - Mobile Grid */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-primary-700 text-primary-700 rounded-full text-sm">Our Values</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">What Drives Us</h2>
            <p className="text-base text-gray-600">Core principles that guide our mission</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${value.gradient} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
};

export default About;
