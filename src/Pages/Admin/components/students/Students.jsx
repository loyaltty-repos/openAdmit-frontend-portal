import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentsTable } from './StudentsTable';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Students() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = getUser();
    setUserRole(user?.role || null);
  }, []);

  // Function to determine if user has required permissions
  const hasCreatePermission = () => userRole === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        
        {/* {hasCreatePermission() && (
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Student
          </Button>
        )} */}
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="unverified">Unverified</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <StudentsTable userRole={userRole} />
        </TabsContent>
        <TabsContent value="verified" className="space-y-4">
          <StudentsTable initialFilters={{ isVerified: 'true' }} userRole={userRole} />
        </TabsContent>
        <TabsContent value="unverified" className="space-y-4">
          <StudentsTable initialFilters={{ isVerified: 'false' }} userRole={userRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
