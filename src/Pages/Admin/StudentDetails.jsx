import { useState } from 'react';
import { StudentProfile } from './components/students/StudentProfile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, FileText, BookOpen, Briefcase, FileQuestion, CheckSquare } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { StudentQuestionnaires } from './components/students/StudentQuestionnaires';
import StudentApplication from './components/students/StudentApplication';

const StudentDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!id) {
    return <div className="p-4 text-center">Student ID not provided</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/admin/students">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
        </div>
      </div>
        
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 max-w-full overflow-x-auto justify-start">
          <TabsTrigger value="profile" className="flex gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex gap-2">
            <FileText className="h-4 w-4" /> Applications
          </TabsTrigger>
          {/* <TabsTrigger value="academics" className="flex gap-2">
            <BookOpen className="h-4 w-4" /> Academics
          </TabsTrigger>
          <TabsTrigger value="career" className="flex gap-2">
            <Briefcase className="h-4 w-4" /> Career
          </TabsTrigger> */}
          <TabsTrigger value="questionnaires" className="flex gap-2">
            <FileQuestion className="h-4 w-4" /> Questionnaires
          </TabsTrigger>
          {/* <TabsTrigger value="timeline" className="flex gap-2">
            <CheckSquare className="h-4 w-4" /> Checklist & Tasks
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="profile">
          <StudentProfile id={id} />
        </TabsContent>
          
        <TabsContent value="applications">
         <StudentApplication studentId={id} />
        </TabsContent>
          
        <TabsContent value="academics">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">Academic Records</h3>
            <p className="text-muted-foreground mt-2">Student academic records will be displayed here.</p>
          </div>
        </TabsContent>
          
        <TabsContent value="career">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">Career Planning</h3>
            <p className="text-muted-foreground mt-2">Student career planning information will be displayed here.</p>
          </div>
        </TabsContent>
          
        <TabsContent value="questionnaires">
          <StudentQuestionnaires studentId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetails;