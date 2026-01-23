import { useState } from 'react';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, ArrowLeft, ArrowRight, GraduationCap, ExternalLink, Globe, Building, Calendar, Loader2 } from 'lucide-react';
import Navigation from '@/components/static/Navigation';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Slider } from '@/Pages/Admin/components/ui/slider';
import { findUniversities } from '@/services/universityService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PremiumCTA from '@/components/static/PremiumCTA';

const CollegeFinderFixed = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    degree: '',
    country: '',
    fieldOfStudy: '',

    // Step 2
    highestEducation: '',
    schoolName: '',
    schoolBoard: '',
    score: '',
    topTenPercent: false,

    // Step 3
    englishTest: '',
    aptitudeTest: '',
    apExams: false,

    // Step 4
    coCurricularRating: [3],
    extraCurricularRating: [3],
    internshipDuration: '',
    internshipUnit: 'Weeks'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters from form data
      const params = {
        degree: formData.degree,
        country: formData.country,
        fieldOfStudy: formData.fieldOfStudy,

        highestEducation : formData.highestEducation,
        schoolName : formData.schoolName,
        schoolBoard : formData.schoolBoard,

        score: formData.score,
        topTenPercent: formData.topTenPercent,
        englishTest: formData.englishTest,
        aptitudeTest: formData.aptitudeTest,
        apExams: formData.apExams,
        coCurricularRating: JSON.stringify(formData.coCurricularRating),
        extraCurricularRating: JSON.stringify(formData.extraCurricularRating),
        internshipDuration: formData.internshipDuration,
        internshipUnit: formData.internshipUnit,
        page
      };
      
      // Call the API
      const response = await findUniversities(params);
      
      // Update state with results
      setUniversities(response.data.universities || []);
      setPagination(response.data.pagination);
      setCurrentPage(response.data.pagination.currentPage);
      setShowResults(true);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      console.error('Error finding universities:', err);
      setError(err.message || 'Failed to find universities. Please try again.');
      toast.error('Failed to find universities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <GraduationCap className="h-8 w-8" />
          TAKE US THROUGH YOUR DREAM EDUCATION
        </CardTitle>
        <CardDescription className="text-lg">Step 1 of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div>
          <Label className="text-base font-medium text-foreground">What degree do you plan to study? *</Label>
          <RadioGroup
            value={formData.degree}
            onValueChange={(value) => handleInputChange('degree', value)}
            className="mt-3"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="bachelor" id="bachelor" className="border-primary" />
              <Label htmlFor="bachelor" className="cursor-pointer">Bachelor&apos;s</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="master" id="master" className="border-primary" />
              <Label htmlFor="master" className="cursor-pointer">Master&apos;s</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">Where do you want to study? *</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger className="mt-3 border-primary/20 focus:border-primary">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20">
              <SelectItem value="united-states">United States</SelectItem>
              <SelectItem value="india">India</SelectItem>
              <SelectItem value="india">Japan</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="australia">Australia</SelectItem>
              <SelectItem value="germany">Germany</SelectItem>
              <SelectItem value="france">France</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">What are you planning to study? *</Label>
          <Select value={formData.fieldOfStudy} onValueChange={(value) => handleInputChange('fieldOfStudy', value)}>
            <SelectTrigger className="mt-3 border-primary/20 focus:border-primary">
              <SelectValue placeholder="Select field of study" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20">
              <SelectItem value="computer-science">Computer Science</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="liberal-arts">Liberal Arts</SelectItem>
              <SelectItem value="law">Law</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 px-8">
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5">
        <CardTitle className="text-2xl font-bold text-primary">TELL US ALL ABOUT YOUR SCHOOL DAYS</CardTitle>
        <CardDescription className="text-lg">Step 2 of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div>
          <Label className="text-base font-medium text-foreground">What is your highest level of education? *</Label>
          <Select value={formData.highestEducation} onValueChange={(value) => handleInputChange('highestEducation', value)}>
            <SelectTrigger className="mt-3 border-primary/20 focus:border-primary">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20">
              <SelectItem value="grade-10">Grade 10</SelectItem>
              <SelectItem value="grade-11">Grade 11</SelectItem>
              <SelectItem value="grade-12">Grade 12</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">What is the name of your school? *</Label>
          <Select value={formData.schoolName} onValueChange={(value) => handleInputChange('schoolName', value)}>
            <SelectTrigger className="mt-3 border-primary/20 focus:border-primary">
              <SelectValue placeholder="Select School" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20">
              <SelectItem value="school1">Delhi Public School</SelectItem>
              <SelectItem value="school2">Kendriya Vidyalaya</SelectItem>
              <SelectItem value="school3">St. Mary&apos;s School</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">School board *</Label>
          <Select value={formData.schoolBoard} onValueChange={(value) => handleInputChange('schoolBoard', value)}>
            <SelectTrigger className="mt-3 border-primary/20 focus:border-primary">
              <SelectValue placeholder="Select a board" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20">
              <SelectItem value="cbse">CBSE</SelectItem>
              <SelectItem value="icse">ICSE</SelectItem>
              <SelectItem value="state-board">State Board</SelectItem>
              <SelectItem value="ib">IB</SelectItem>
              <SelectItem value="igcse">IGCSE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">Your score *</Label>
          <div className="flex items-center space-x-2 mt-3">
            <Input
              type="number"
              placeholder="85"
              value={formData.score}
              onChange={(e) => handleInputChange('score', e.target.value)}
              className="flex-1 border-primary/20 focus:border-primary"
            />
            <span className="text-muted-foreground">out of 100%</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
          <Checkbox
            id="top-ten"
            checked={formData.topTenPercent}
            onCheckedChange={(checked) => handleInputChange('topTenPercent', checked)}
            className="border-primary"
          />
          <Label htmlFor="top-ten" className="text-base cursor-pointer">Are you in top 10% of your class?</Label>
        </div>

        <div className="flex justify-between pt-6">
          <Button onClick={prevStep} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 px-8">
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5">
        <CardTitle className="text-2xl font-bold text-primary">FILL UP YOUR TEST SCORES</CardTitle>
        <CardDescription className="text-lg">Step 3 of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div>
          <Label className="text-base font-medium text-foreground">Which English test did you take? *</Label>
          <RadioGroup
            value={formData.englishTest}
            onValueChange={(value) => handleInputChange('englishTest', value)}
            className="mt-3"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="TOEFL" id="toefl" className="border-primary" />
              <Label htmlFor="toefl" className="cursor-pointer">TOEFL</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="IELTS" id="ielts" className="border-primary" />
              <Label htmlFor="ielts" className="cursor-pointer">IELTS</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="PTE" id="pte" className="border-primary" />
              <Label htmlFor="pte" className="cursor-pointer">PTE</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">Which aptitude test did you take? *</Label>
          <RadioGroup
            value={formData.aptitudeTest}
            onValueChange={(value) => handleInputChange('aptitudeTest', value)}
            className="mt-3"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="SAT" id="sat" className="border-primary" />
              <Label htmlFor="sat" className="cursor-pointer">SAT</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="ACT" id="act" className="border-primary" />
              <Label htmlFor="act" className="cursor-pointer">ACT</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="GRE" id="gre" className="border-primary" />
              <Label htmlFor="gre" className="cursor-pointer">GRE</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
          <Checkbox
            id="ap-exams"
            checked={formData.apExams}
            onCheckedChange={(checked) => handleInputChange('apExams', checked)}
            className="border-primary"
          />
          <Label htmlFor="ap-exams" className="text-base cursor-pointer">Did you take any AP exams/ Honors courses?</Label>
        </div>

        <div className="flex justify-between pt-6">
          <Button onClick={prevStep} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 px-8">
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5">
        <CardTitle className="text-2xl font-bold text-primary">SOMETIMES IT&apos;S GOOD TO SHOW OFF</CardTitle>
        <CardDescription className="text-lg">Step 4 of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        <div>
          <Label className="text-base font-medium text-foreground">Co-curriculars</Label>
          <div className="mt-4 space-y-3">
            <Label className="text-sm text-muted-foreground">Rate your performance in Co-curricular *</Label>
            <div className="space-y-3">
              <Slider
                value={formData.coCurricularRating}
                onValueChange={(value) => handleInputChange('coCurricularRating', value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1</span>
                <span className="font-bold text-primary text-lg">{formData.coCurricularRating[0]}</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">Extra-curriculars</Label>
          <div className="mt-4 space-y-3">
            <Label className="text-sm text-muted-foreground">Rate your performance in Extra-curricular *</Label>
            <div className="space-y-3">
              <Slider
                value={formData.extraCurricularRating}
                onValueChange={(value) => handleInputChange('extraCurricularRating', value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1</span>
                <span className="font-bold text-primary text-lg">{formData.extraCurricularRating[0]}</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium text-foreground">Internship/Work Experience</Label>
          <div className="mt-4">
            <Label className="text-sm text-muted-foreground">Duration of internship (if any) *</Label>
            <div className="flex items-center space-x-2 mt-3">
              <Input
                type="number"
                placeholder="e.g: 4"
                value={formData.internshipDuration}
                onChange={(e) => handleInputChange('internshipDuration', e.target.value)}
                className="flex-1 border-primary/20 focus:border-primary"
              />
              <Select value={formData.internshipUnit} onValueChange={(value) => handleInputChange('internshipUnit', value)}>
                <SelectTrigger className="w-32 border-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/20">
                  <SelectItem value="Weeks">Weeks</SelectItem>
                  <SelectItem value="Months">Months</SelectItem>
                  <SelectItem value="Years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button onClick={prevStep} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-primary hover:bg-primary/90 px-8"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Universities...
              </>
            ) : (
              <>
                Find Universities <Search className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // University Results Component
  const UniversityResults = () => {
    if (!showResults) return null;
    
    return (
      <section id="results-section" className="mt-16 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Your University Matches</h2>
          <p className="text-lg text-muted-foreground">
            Based on your profile, we've found {universities.length} universities that might be a good fit for you.
          </p>
        </div>
        
        {universities.length === 0 ? (
          <div className="text-center p-8 bg-muted/30 rounded-lg">
            <p className="text-xl font-medium">No universities found matching your criteria.</p>
            <p className="mt-2 text-muted-foreground">Try adjusting your search parameters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university) => (
              <Card key={university._id} className="overflow-hidden hover:shadow-lg transition-shadow p-0 flex flex-col">
                <div className="aspect-[16/9] bg-muted relative overflow-hidden p-0 m-0 w-full border-0">
                  {university.banner ? (
                    <img 
                      src={university.banner} 
                      alt={`${university.name} banner`} 
                      className="w-full h-full object-cover object-center block"
                      style={{ margin: 0, display: 'block', verticalAlign: 'top' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                        e.target.parentNode.innerHTML = '<div class="flex flex-col items-center justify-center"><Building class="w-12 h-12 text-primary/40" /><p class="text-sm text-muted-foreground mt-2">No image available</p></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10">
                      <Building className="w-12 h-12 text-primary/40" />
                      <p className="text-sm text-muted-foreground mt-2">No image available</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      className={`${university.matchLevel === 'Poor' ? 'bg-red-500' : 
                        university.matchLevel === 'Fair' ? 'bg-yellow-500' : 
                        university.matchLevel === 'Good' ? 'bg-green-500' : 'bg-blue-500'}`}
                    >
                      {university.matchPercentage} Match
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="flex flex-row items-center gap-3 pb-2 pt-3 px-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                    {university.logo ? (
                      <img 
                        src={university.logo} 
                        alt={`${university.name} logo`} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<div class="flex flex-col items-center justify-center"><GraduationCap class="w-6 h-6 text-primary" /></div>';
                        }}
                      />
                    ) : (
                      <GraduationCap className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{university.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-3 h-3 mr-1" />
                      <span>{university.location || 'Location not specified'}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Program</p>
                      <p className="font-medium">{university.program || 'Various Programs'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{university.universityType || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tuition Fee</p>
                      <p className="font-medium">
                        {university.tuitionFee ? `₹${university.tuitionFee}` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Acceptance Rate</p>
                      <p className="font-medium">{university.acceptanceRate || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="font-medium mb-2">AI Analysis</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Academic Fit:</span>
                        <span className="font-medium">{university.aiAnalysis?.academicFit || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Test Score:</span>
                        <span className="font-medium">{university.aiAnalysis?.testScoreCompatibility || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extracurricular:</span>
                        <span className="font-medium">{university.aiAnalysis?.extracurricularMatch || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Admission Probability:</span>
                        <span className="font-medium">{university.aiAnalysis?.admissionProbability || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 border-primary text-primary hover:bg-primary/10"
                    onClick={() => window.open(university.website_url || '#', '_blank')}
                  >
                    View Details <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            College Finder
          </h1>
          <p className="text-xl text-muted-foreground">
            Find your perfect university match through our guided questionnaire
          </p>
        </div>

        {/* Progress indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${currentStep >= step
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-muted'
                    }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${currentStep > step ? 'bg-primary' : 'bg-muted'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Render current step */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        
        {/* Display university results */}
        <UniversityResults />
        {pagination && (
          <div className="flex justify-center my-6 gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrevPage}
              onClick={() => handleSubmit(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => handleSubmit(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <p className="font-medium">Error finding universities:</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Premium CTA Section */}
        {showResults && universities.length > 0 && <PremiumCTA />}
      </main>

      <Footer />
    </div>
  );
};

export default CollegeFinderFixed;
