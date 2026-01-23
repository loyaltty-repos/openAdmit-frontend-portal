
import { useState } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const CollegeFinderStep2 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    highestEducation: '',
    schoolName: '',
    schoolBoard: '',
    score: '',
    topTenPercent: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    console.log('Step 2 data:', formData);
    navigate('/college-finder/step3');
  };

  const prevStep = () => {
    navigate('/college-finder/step1');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            College Finder - Step 2
          </h1>
          <p className="text-xl text-muted-foreground">
            Tell us about your school days
          </p>
        </div>

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
      </main>

      <Footer />
    </div>
  );
};

export default CollegeFinderStep2;
