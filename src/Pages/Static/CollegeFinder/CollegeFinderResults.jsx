
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, DollarSign, GraduationCap, Star, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PremiumCTA from '../components/PremiumCTA';
import Footer from '../components/Footer';

const CollegeFinderResults = () => {
  const navigate = useNavigate();

  // Mock university data - this would come from an API based on user's form data
  const universities = [
    {
      id: 1,
      name: 'Stanford University',
      location: 'California, USA',
      tuitionFee: '$56,169',
      ranking: '#3 in National Universities',
      acceptanceRate: '4%',
      programs: ['Computer Science', 'Engineering', 'Business'],
      matchScore: 95,
      type: 'Private'
    },
    {
      id: 2,
      name: 'Massachusetts Institute of Technology',
      location: 'Massachusetts, USA',
      tuitionFee: '$57,986',
      ranking: '#2 in National Universities',
      acceptanceRate: '7%',
      programs: ['Engineering', 'Computer Science', 'Physics'],
      matchScore: 92,
      type: 'Private'
    },
    {
      id: 3,
      name: 'University of California, Berkeley',
      location: 'California, USA',
      tuitionFee: '$14,226',
      ranking: '#22 in National Universities',
      acceptanceRate: '17%',
      programs: ['Engineering', 'Computer Science', 'Liberal Arts'],
      matchScore: 88,
      type: 'Public'
    },
    {
      id: 4,
      name: 'Carnegie Mellon University',
      location: 'Pennsylvania, USA',
      tuitionFee: '$59,864',
      ranking: '#25 in National Universities',
      acceptanceRate: '13%',
      programs: ['Computer Science', 'Engineering', 'Arts'],
      matchScore: 85,
      type: 'Private'
    },
    {
      id: 5,
      name: 'University of Toronto',
      location: 'Ontario, Canada',
      tuitionFee: 'CAD $58,160',
      ranking: '#18 in Global Universities',
      acceptanceRate: '43%',
      programs: ['Engineering', 'Medicine', 'Business'],
      matchScore: 82,
      type: 'Public'
    }
  ];

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const backToFinder = () => {
    navigate('/college-finder');
  };

  const downloadResults = () => {
    // This would generate a PDF or CSV of the results
    alert('Downloading your university match results...');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Your University Matches
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Based on your profile, here are the universities that match your preferences
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Button onClick={backToFinder} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Finder
            </Button>
            <Button onClick={downloadResults} className="bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" /> Download Results
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{universities.length}</div>
              <div className="text-muted-foreground">Universities Found</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {universities.filter(u => u.matchScore >= 80).length}
              </div>
              <div className="text-muted-foreground">High Match</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(universities.reduce((acc, u) => acc + u.matchScore, 0) / universities.length)}%
              </div>
              <div className="text-muted-foreground">Average Match</div>
            </CardContent>
          </Card>
        </div>

        {/* University Cards */}
        <div className="space-y-6">
          {universities.map((university) => (
            <Card key={university.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-primary mb-2">{university.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-lg">
                      <MapPin className="h-4 w-4" />
                      {university.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getMatchScoreColor(university.matchScore)} text-white mb-2`}>
                      {university.matchScore}% Match
                    </Badge>
                    <div className="text-sm text-muted-foreground">{university.type}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Tuition Fee:</span>
                      <span className="text-green-600 font-semibold">{university.tuitionFee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Ranking:</span>
                      <span>{university.ranking}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Acceptance Rate:</span>
                      <span className="text-blue-600 font-semibold">{university.acceptanceRate}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Available Programs:</div>
                    <div className="flex flex-wrap gap-2">
                      {university.programs.map((program, index) => (
                        <Badge key={index} variant="secondary">
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button className="bg-primary hover:bg-primary/90">
                    View Details
                  </Button>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    Save to Favorites
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium Upselling Section */}
        <PremiumCTA />

        {/* Table View Toggle */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Comparison</CardTitle>
            <CardDescription>Compare all universities at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>University</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tuition Fee</TableHead>
                  <TableHead>Acceptance Rate</TableHead>
                  <TableHead>Match Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell className="font-medium">{university.name}</TableCell>
                    <TableCell>{university.location}</TableCell>
                    <TableCell>{university.tuitionFee}</TableCell>
                    <TableCell>{university.acceptanceRate}</TableCell>
                    <TableCell>
                      <Badge className={`${getMatchScoreColor(university.matchScore)} text-white`}>
                        {university.matchScore}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CollegeFinderResults;
