
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Users, Search, BookOpen, Globe, Briefcase, Heart, Code, Camera, Music, MapPin, Clock, Star } from 'lucide-react';
import Navigation from './components/Navigation';
import Footer from '@/components/static/Footer';
import CTA from '@/components/static/CTA';

const Community = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  const communities = [
    {
      id: 1,
      name: 'Study Abroad Europe',
      description: 'Connect with students planning to study in European universities. Share experiences, tips, and support each other through your academic journey.',
      members: 2847,
      category: 'Education',
      icon: Globe,
      tags: ['Europe', 'Study Abroad', 'Universities'],
      isActive: true,
      location: 'Europe',
      rating: 4.8,
      recentActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Engineering Students Hub',
      description: 'A community for engineering students worldwide. Discuss projects, share resources, and network with peers in the tech industry.',
      members: 4521,
      category: 'Academic',
      icon: Code,
      tags: ['Engineering', 'Technology', 'Projects'],
      isActive: true,
      location: 'Global',
      rating: 4.9,
      recentActivity: '1 hour ago'
    },
    {
      id: 3,
      name: 'Business School Network',
      description: 'MBA and business students connecting globally. Share opportunities, case studies, and career advice for future leaders.',
      members: 1923,
      category: 'Business',
      icon: Briefcase,
      tags: ['MBA', 'Business', 'Networking'],
      isActive: true,
      location: 'Global',
      rating: 4.7,
      recentActivity: '30 minutes ago'
    },
    {
      id: 4,
      name: 'Medical Students Unite',
      description: 'Future doctors supporting each other through medical school journey. Study tips, experiences, and mentorship opportunities.',
      members: 3156,
      category: 'Medical',
      icon: Heart,
      tags: ['Medicine', 'Healthcare', 'Study Tips'],
      isActive: true,
      location: 'Global',
      rating: 4.9,
      recentActivity: '45 minutes ago'
    },
    {
      id: 5,
      name: 'Creative Arts & Design',
      description: 'Artists, designers, and creative minds sharing inspiration, portfolios, and collaborative opportunities in the creative industry.',
      members: 1687,
      category: 'Arts',
      icon: Camera,
      tags: ['Art', 'Design', 'Creative'],
      isActive: true,
      location: 'Global',
      rating: 4.6,
      recentActivity: '3 hours ago'
    },
    {
      id: 6,
      name: 'Music & Performing Arts',
      description: 'Musicians and performers connecting worldwide. Share performances, collaborate, and find opportunities in the entertainment industry.',
      members: 892,
      category: 'Arts',
      icon: Music,
      tags: ['Music', 'Performance', 'Collaboration'],
      isActive: true,
      location: 'Global',
      rating: 4.8,
      recentActivity: '1 hour ago'
    }
  ];

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleJoinCommunity = (communityId) => {
    if (joinedCommunities.includes(communityId)) {
      setJoinedCommunities(joinedCommunities.filter(id => id !== communityId));
    } else {
      setJoinedCommunities([...joinedCommunities, communityId]);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Education: 'bg-blue-100 text-blue-800 border-blue-200',
      Academic: 'bg-purple-100 text-purple-800 border-purple-200',
      Business: 'bg-green-100 text-green-800 border-green-200',
      Medical: 'bg-red-100 text-red-800 border-red-200',
      Arts: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <main className="pt-15">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Join Our Global Communities
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-4xl mx-auto leading-relaxed">
              Connect with like-minded students from around the world. Share experiences,
              get support, and build lasting friendships in your field of interest.
            </p>

            {/* Improved Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input
                  type="text"
                  placeholder="Search communities by name, subject, or interest..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-base rounded-xl border-2 border-white/20 bg-white text-gray-900 placeholder:text-gray-500 focus:border-white focus:ring-2 focus:ring-white/20 transition-all duration-300 shadow-xl w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Communities Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Discover Communities</h2>
                <p className="text-lg text-gray-600">
                  {filteredCommunities.length} communities waiting for you
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCommunities.map((community) => {
                const IconComponent = community.icon;
                const isJoined = joinedCommunities.includes(community.id);

                return (
                  <Card key={community.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-4 relative">
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <Avatar className="h-16 w-16 bg-gradient-to-br from-primary to-primary-600 shadow-lg">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-600">
                            <IconComponent className="w-8 h-8 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <Badge className={`${getCategoryColor(community.category)} border font-medium px-3 py-1`}>
                          {community.category}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                          {community.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base leading-relaxed">
                          {community.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">
                            {community.members.toLocaleString()} members
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{community.rating}</span>
                        </div>
                      </div>

                      {/* Location and Activity */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{community.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{community.recentActivity}</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {community.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs px-3 py-1 border-gray-200 text-gray-600 hover:bg-primary/5 hover:border-primary/20 transition-colors duration-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Join Button */}
                      <Button
                        onClick={() => handleJoinCommunity(community.id)}
                        className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 ${isJoined
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
                          : 'bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                          } transform hover:scale-[1.02]`}
                      >
                        {isJoined ? (
                          <span className="flex items-center gap-2">
                            <Heart className="w-5 h-5 fill-current" />
                            Joined
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Join Community
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredCommunities.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                  <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No communities found</h3>
                  <p className="text-gray-600">Try adjusting your search terms to discover more communities.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Community Stats */}
        <section className="bg-gradient-to-r from-white to-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Community Impact</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our communities have helped thousands of students connect, learn, and succeed together across the globe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  value: communities.reduce((total, community) => total + community.members, 0).toLocaleString(),
                  label: 'Total Members',
                  icon: Users
                },
                {
                  value: communities.length.toString(),
                  label: 'Active Communities',
                  icon: Globe
                },
                {
                  value: '50+',
                  label: 'Countries Represented',
                  icon: MapPin
                },
                {
                  value: '24/7',
                  label: 'Community Support',
                  icon: Heart
                }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTA/>
        <Footer/>
      </main>
    </div>
  );
};

export default Community;
