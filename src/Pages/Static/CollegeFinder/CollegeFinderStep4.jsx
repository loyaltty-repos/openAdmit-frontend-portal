
import { useState } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Slider } from '../components/ui/slider';

const CollegeFinderStep4 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

  const prevStep = () => {
    navigate('/college-finder/step3');
  };

  const handleSubmit = () => {
    console.log('Final form data:', formData);
    // Navigate to results page instead of showing alert
    navigate('/university-finder/results');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            College Finder - Step 4
          </h1>
          <p className="text-xl text-muted-foreground">
            Show off your achievements
          </p>
        </div>

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
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 px-8">
                Find Universities <Search className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CollegeFinderStep4;
