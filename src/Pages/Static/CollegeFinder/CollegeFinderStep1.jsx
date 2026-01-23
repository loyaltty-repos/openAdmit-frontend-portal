
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navigation from '../components/Navigation';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

const CollegeFinderStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    degree: '',
    country: '',
    fieldOfStudy: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    console.log('Step 1 data:', formData);
    navigate('/college-finder/step2');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            College Finder - Step 1
          </h1>
          <p className="text-xl text-muted-foreground">
            Tell us about your dream education
          </p>
        </div>

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
      </main>

      <Footer />
    </div>
  );
};

export default CollegeFinderStep1;
