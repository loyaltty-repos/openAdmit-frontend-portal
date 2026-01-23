
import { useState } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

const CollegeFinderStep3 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    englishTest: '',
    aptitudeTest: '',
    apExams: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    console.log('Step 3 data:', formData);
    navigate('/college-finder/step4');
  };

  const prevStep = () => {
    navigate('/college-finder/step2');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            College Finder - Step 3
          </h1>
          <p className="text-xl text-muted-foreground">
            Tell us about your test scores
          </p>
        </div>

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
                  <RadioGroupItem value="toefl" id="toefl" className="border-primary" />
                  <Label htmlFor="toefl" className="cursor-pointer">TOEFL</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="ielts" id="ielts" className="border-primary" />
                  <Label htmlFor="ielts" className="cursor-pointer">IELTS</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="pte" id="pte" className="border-primary" />
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
                  <RadioGroupItem value="sat" id="sat" className="border-primary" />
                  <Label htmlFor="sat" className="cursor-pointer">SAT</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="act" id="act" className="border-primary" />
                  <Label htmlFor="act" className="cursor-pointer">ACT</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="academic" id="academic" className="border-primary" />
                  <Label htmlFor="academic" className="cursor-pointer">Academic</Label>
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
      </main>

      <Footer />
    </div>
  );
};

export default CollegeFinderStep3;
