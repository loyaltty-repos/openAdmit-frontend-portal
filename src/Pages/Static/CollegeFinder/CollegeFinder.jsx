
import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, ArrowLeft, ArrowRight, GraduationCap, ExternalLink, Globe, Building, Award, DollarSign, Calendar, Loader2 } from 'lucide-react';
import Navigation from '@/components/static/Navigation';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Slider } from '@/Pages/Admin/components/ui/slider';
import { findUniversities } from '@/services/universityService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CollegeFinder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters from form data
      const params = {
        score: formData.score,
        topTenPercent: formData.topTenPercent,
        englishTest: formData.englishTest,
        aptitudeTest: formData.aptitudeTest,
        coCurricularRating: JSON.stringify(formData.coCurricularRating),
        extraCurricularRating: JSON.stringify(formData.extraCurricularRating),
        internshipDuration: formData.internshipDuration,
        internshipUnit: formData.internshipUnit
      };
      
      // Call the API
      const response = await findUniversities(params);
      
      // Update state with results
      setUniversities(response.data.universities || []);
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
    <Card className="w-[95%] sm:w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5 px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-primary flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
          <span className="text-center mx-auto sm:mx-0">TAKE US THROUGH YOUR DREAM EDUCATION</span>
        </CardTitle>
        <CardDescription className="text-base sm:text-lg mt-2">Step 1 of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">What degree do you plan to study? *</Label>
          <RadioGroup
            value={formData.degree}
            onValueChange={(value) => handleInputChange('degree', value)}
            className="mt-2 sm:mt-3"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="bachelor" id="bachelor" className="border-primary" />
              <Label htmlFor="bachelor" className="cursor-pointer text-sm sm:text-base">Bachelor&apos;s</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="master" id="master" className="border-primary" />
              <Label htmlFor="master" className="cursor-pointer text-sm sm:text-base">Master&apos;s</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">Where do you want to study? *</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger className="mt-2 sm:mt-3 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20 text-sm sm:text-base">
              <SelectItem value="united-states">United States</SelectItem>
              <SelectItem value="canada">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="australia">Australia</SelectItem>
              <SelectItem value="germany">Germany</SelectItem>
              <SelectItem value="france">France</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">What are you planning to study? *</Label>
          <Select value={formData.fieldOfStudy} onValueChange={(value) => handleInputChange('fieldOfStudy', value)}>
            <SelectTrigger className="mt-2 sm:mt-3 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10">
              <SelectValue placeholder="Select field of study" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20 text-sm sm:text-base">
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

        <div className="flex justify-end pt-4 sm:pt-6">
          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 px-4 sm:px-8 text-sm sm:text-base py-2 h-9 sm:h-10 w-full sm:w-auto">
            Next <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-[95%] sm:w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5 px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-primary text-center mx-auto">TELL US ALL ABOUT YOUR SCHOOL DAYS</CardTitle>
        <CardDescription className="text-base sm:text-lg mt-2">Step 2 of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">What is your highest level of education? *</Label>
          <Select value={formData.highestEducation} onValueChange={(value) => handleInputChange('highestEducation', value)}>
            <SelectTrigger className="mt-2 sm:mt-3 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20 text-sm sm:text-base">
              <SelectItem value="grade-10">Grade 10</SelectItem>
              <SelectItem value="grade-11">Grade 11</SelectItem>
              <SelectItem value="grade-12">Grade 12</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">What is the name of your school? *</Label>
          <Select value={formData.schoolName} onValueChange={(value) => handleInputChange('schoolName', value)}>
            <SelectTrigger className="mt-2 sm:mt-3 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10">
              <SelectValue placeholder="Select School" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20 text-sm sm:text-base">
              <SelectItem value="school1">Delhi Public School</SelectItem>
              <SelectItem value="school2">Kendriya Vidyalaya</SelectItem>
              <SelectItem value="school3">St. Mary&apos;s School</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">School board *</Label>
          <Select value={formData.schoolBoard} onValueChange={(value) => handleInputChange('schoolBoard', value)}>
            <SelectTrigger className="mt-2 sm:mt-3 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10">
              <SelectValue placeholder="Select a board" />
            </SelectTrigger>
            <SelectContent className="bg-background border-primary/20 text-sm sm:text-base">
              <SelectItem value="cbse">CBSE</SelectItem>
              <SelectItem value="icse">ICSE</SelectItem>
              <SelectItem value="state-board">State Board</SelectItem>
              <SelectItem value="ib">IB</SelectItem>
              <SelectItem value="igcse">IGCSE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">Your score *</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-3">
            <Input
              type="number"
              placeholder="85"
              value={formData.score}
              onChange={(e) => handleInputChange('score', e.target.value)}
              className="flex-1 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10"
            />
            <span className="text-xs sm:text-sm text-muted-foreground">out of 100%</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-primary/5 transition-colors">
          <Checkbox
            id="top-ten"
            checked={formData.topTenPercent}
            onCheckedChange={(checked) => handleInputChange('topTenPercent', checked)}
            className="border-primary"
          />
          <Label htmlFor="top-ten" className="text-sm sm:text-base cursor-pointer">Are you in top 10% of your class?</Label>
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

  const renderStep3 = () => (
    <Card className="w-[95%] sm:w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5 px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-primary text-center mx-auto">FILL UP YOUR TEST SCORES</CardTitle>
        <CardDescription className="text-base sm:text-lg mt-2">Step 3 of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">Which English test did you take? *</Label>
          <RadioGroup
            value={formData.englishTest}
            onValueChange={(value) => handleInputChange('englishTest', value)}
            className="mt-2 sm:mt-3"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="toefl" id="toefl" className="border-primary" />
              <Label htmlFor="toefl" className="cursor-pointer text-sm sm:text-base">TOEFL</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="ielts" id="ielts" className="border-primary" />
              <Label htmlFor="ielts" className="cursor-pointer text-sm sm:text-base">IELTS</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="pte" id="pte" className="border-primary" />
              <Label htmlFor="pte" className="cursor-pointer text-sm sm:text-base">PTE</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">Which aptitude test did you take? *</Label>
          <RadioGroup
            value={formData.aptitudeTest}
            onValueChange={(value) => handleInputChange('aptitudeTest', value)}
            className="mt-2 sm:mt-3"
          >
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="sat" id="sat" className="border-primary" />
              <Label htmlFor="sat" className="cursor-pointer text-sm sm:text-base">SAT</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="act" id="act" className="border-primary" />
              <Label htmlFor="act" className="cursor-pointer text-sm sm:text-base">ACT</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
              <RadioGroupItem value="academic" id="academic" className="border-primary" />
              <Label htmlFor="academic" className="cursor-pointer text-sm sm:text-base">Academic</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-primary/5 transition-colors">
          <Checkbox
            id="ap-exams"
            checked={formData.apExams}
            onCheckedChange={(checked) => handleInputChange('apExams', checked)}
            className="border-primary"
          />
          <Label htmlFor="ap-exams" className="text-sm sm:text-base cursor-pointer">Did you take any AP exams/ Honors courses?</Label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
          <Button onClick={prevStep} variant="outline" className="border-primary text-primary hover:bg-primary/10 text-sm sm:text-base h-9 sm:h-10">
            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 px-4 sm:px-8 text-sm sm:text-base h-9 sm:h-10 w-full sm:w-auto">
            Next <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-[92%] sm:w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary/5 p-2 sm:px-4 md:px-6 sm:py-6">
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Step 4 of 4</span>
          <h3 className="text-sm sm:text-xl md:text-2xl font-bold text-primary mt-1">Skills</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-6 md:p-8">
        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">Co-curriculars</Label>
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm text-muted-foreground">Rate your performance in Co-curricular *</Label>
            <div className="space-y-2 sm:space-y-3">
              <Slider
                value={formData.coCurricularRating}
                onValueChange={(value) => handleInputChange('coCurricularRating', value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>1</span>
                <span className="font-bold text-primary text-base sm:text-lg">{formData.coCurricularRating[0]}</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">Extra-curriculars</Label>
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm text-muted-foreground">Rate your performance in Extra-curricular *</Label>
            <div className="space-y-2 sm:space-y-3">
              <Slider
                value={formData.extraCurricularRating}
                onValueChange={(value) => handleInputChange('extraCurricularRating', value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>1</span>
                <span className="font-bold text-primary text-base sm:text-lg">{formData.extraCurricularRating[0]}</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm sm:text-base font-medium text-foreground">Internship/Work Experience</Label>
          <div className="mt-3 sm:mt-4">
            <Label className="text-xs sm:text-sm text-muted-foreground">Duration of internship (if any) *</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mt-2 sm:mt-3">
              <Input
                type="number"
                placeholder="e.g: 4"
                value={formData.internshipDuration}
                onChange={(e) => handleInputChange('internshipDuration', e.target.value)}
                className="flex-1 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10"
              />
              <Select value={formData.internshipUnit} onValueChange={(value) => handleInputChange('internshipUnit', value)}>
                <SelectTrigger className="w-full sm:w-32 border-primary/20 focus:border-primary text-sm sm:text-base h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/20 text-sm sm:text-base">
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
      <section id="results-section" className="mt-8 sm:mt-12 md:mt-16 mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">Your University Matches</h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Based on your profile, we've found {universities.length} universities that might be a good fit for you.
          </p>
        </div>
        
        {universities.length === 0 ? (
          <div className="text-center p-4 sm:p-8 bg-muted/30 rounded-lg">
            <p className="text-lg sm:text-xl font-medium">No universities found matching your criteria.</p>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Try adjusting your search parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {universities.map((university) => (
              <Card key={university._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 sm:h-40 bg-muted relative">
                  {university.banner ? (
                    <img 
                      src={university.banner} 
                      alt={`${university.name} banner`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Building className="w-8 h-8 sm:w-12 sm:h-12 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <Badge 
                      className={`${university.matchLevel === 'Poor' ? 'bg-red-500' : 
                        university.matchLevel === 'Fair' ? 'bg-yellow-500' : 
                        university.matchLevel === 'Good' ? 'bg-green-500' : 'bg-blue-500'} text-xs sm:text-sm`}
                    >
                      {university.matchPercentage} Match
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="flex flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 pb-1 sm:pb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                    {university.logo ? (
                      <img 
                        src={university.logo} 
                        alt={`${university.name} logo`} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">{university.name}</CardTitle>
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground max-w-full">
                      <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{university.location || 'Location not specified'}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0 sm:pt-0">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Program</p>
                      <p className="font-medium truncate">{university.program || 'Various Programs'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Type</p>
                      <p className="font-medium truncate">{university.universityType || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Tuition Fee</p>
                      <p className="font-medium truncate">
                        {university.tuitionFee ? `₹${university.tuitionFee}` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Acceptance Rate</p>
                      <p className="font-medium truncate">{university.acceptanceRate || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 sm:pt-3 border-t">
                    <p className="font-medium mb-1 sm:mb-2 text-xs sm:text-sm">AI Analysis</p>
                    <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-[10px] sm:text-xs">
                      <div className="flex justify-between">
                        <span className="flex-shrink-0">Academic Fit:</span>
                        <span className="font-medium ml-1">{university.aiAnalysis?.academicFit || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex-shrink-0">Test Score:</span>
                        <span className="font-medium ml-1">{university.aiAnalysis?.testScoreCompatibility || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex-shrink-0">Extracurricular:</span>
                        <span className="font-medium ml-1">{university.aiAnalysis?.extracurricularMatch || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex-shrink-0">Admission:</span>
                        <span className="font-medium ml-1">{university.aiAnalysis?.admissionProbability || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-1 sm:mt-2 border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                    onClick={() => window.open(university.website_url || '#', '_blank')}
                  >
                    View Details <ExternalLink className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
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

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-20 sm:pt-24 overflow-hidden flex flex-col items-center">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2 sm:mb-4">
            College Finder
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground px-2">
            Find your perfect university match through our guided questionnaire
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-[92%] sm:w-full max-w-2xl mx-auto mb-6 sm:mb-8">
          {/* Mobile view with 3+1 layout */}
          <div className="block sm:hidden">
            {/* First row with steps 1-3 */}
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${currentStep >= step
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-muted'
                      }`}
                  >
                    {step}
                  </div>
                  <div
                    className={`w-4 h-1 mx-1 transition-colors ${currentStep > step ? 'bg-primary' : 'bg-muted'}`}
                  />
                </div>
              ))}
            </div>
            
            {/* Second row with step 4 centered */}
            <div className="flex justify-center items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${currentStep >= 4
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-muted'
                  }`}
              >
                4
              </div>
            </div>
          </div>
          
          {/* Desktop view with all steps in one row */}
          <div className="hidden sm:flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium border transition-colors ${currentStep >= step
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-muted'
                    }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-6 md:w-12 h-1 mx-1 md:mx-2 transition-colors ${currentStep > step ? 'bg-primary' : 'bg-muted'}`}
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
        
        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6 sm:mt-8 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <p className="font-medium text-sm sm:text-base">Error finding universities:</p>
            <p className="text-sm sm:text-base break-words">{error}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CollegeFinder;
