import { useState, useEffect } from "react";
import { getUserProfile } from "@/services/api.services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilIcon } from "lucide-react";
import ProfileEditForm from "./components/ProfileEditForm";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.status) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditMode = () => {
    setEditMode(false);
  };

  const handleSuccess = () => {
    fetchUserProfile();
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (editMode) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your profile information</p>
          </div>
          <Button variant="outline" onClick={handleCloseEditMode}>
            Cancel
          </Button>
        </div>
        <ProfileEditForm userData={userData} onClose={handleCloseEditMode} onSuccess={handleSuccess} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your profile information</p>
        </div>
        <Button onClick={() => setEditMode(true)} className="bg-primary-1 hover:bg-primary/90 cursor-pointer">
          <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="academic">Academic Details</TabsTrigger>
          <TabsTrigger value="exams">Exam Details</TabsTrigger>
          <TabsTrigger value="visa">Visa Details</TabsTrigger>
        </TabsList>       
         <TabsContent value="personal">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 shadow-md flex-shrink-0">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <img
                      src="/profile-full.svg"
                      alt="Default Profile"
                      className="w-16 h-16 text-gray-400"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your personal and contact details</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Full Name</p>
                  <p className="text-base">{userData?.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Email</p>
                  <p className="text-base">{userData?.email}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Phone Number</p>
                  <p className="text-base">{userData?.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Date of Birth</p>
                  <p className="text-base">
                    {userData?.personalDetails?.dob 
                      ? format(new Date(userData.personalDetails.dob), "MMMM d, yyyy") 
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Gender</p>
                  <p className="text-base">{userData?.personalDetails?.gender || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Profession</p>
                  <p className="text-base">{userData?.personalDetails?.profession || "Not provided"}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="font-medium text-sm text-muted-foreground">Address</p>
                  <p className="text-base">{userData?.personalDetails?.address || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div>
                <CardTitle>Program Details</CardTitle>
                <CardDescription>Your program information</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Program</p>
                  <p className="text-base">{userData?.programDetails?.program || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Validity</p>
                  <p className="text-base">
                    {userData?.programDetails?.validity 
                      ? format(new Date(userData.programDetails.validity), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>College Details</CardTitle>
                <CardDescription>Your academic information</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Branch</p>
                  <p className="text-base">{userData?.collegeDetails?.branch || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Highest Degree</p>
                  <p className="text-base">{userData?.collegeDetails?.highestDegree || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">University</p>
                  <p className="text-base">{userData?.collegeDetails?.university || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">College</p>
                  <p className="text-base">{userData?.collegeDetails?.college || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">GPA</p>
                  <p className="text-base">{userData?.collegeDetails?.gpa || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Topper&apos;s GPA</p>
                  <p className="text-base">{userData?.collegeDetails?.toppersGPA || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Number of Backlogs</p>
                  <p className="text-base">{userData?.collegeDetails?.noOfBacklogs || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Admission Term</p>
                  <p className="text-base">{userData?.collegeDetails?.admissionTerm || "Not provided"}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="font-medium text-sm text-muted-foreground">Courses Applying</p>
                  <p className="text-base">
                    {userData?.collegeDetails?.coursesApplying && userData.collegeDetails.coursesApplying.length > 0
                      ? userData.collegeDetails.coursesApplying.join(", ")
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>GRE Details</CardTitle>
                <CardDescription>Your GRE examination information</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">GRE Plan Date</p>
                  <p className="text-base">
                    {userData?.greDetails?.grePlane 
                      ? format(new Date(userData.greDetails.grePlane), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">GRE Exam Date</p>
                  <p className="text-base">
                    {userData?.greDetails?.greDate 
                      ? format(new Date(userData.greDetails.greDate), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Verbal Score</p>
                  <p className="text-base">{userData?.greDetails?.greScore?.verbal || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Quantitative Score</p>
                  <p className="text-base">{userData?.greDetails?.greScore?.quant || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">AWA Score</p>
                  <p className="text-base">{userData?.greDetails?.greScore?.awa || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Retaking GRE</p>
                  <p className="text-base">{userData?.greDetails?.retakingGRE || "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div>
                <CardTitle>IELTS Details</CardTitle>
                <CardDescription>Your IELTS examination information</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">IELTS Plan Date</p>
                  <p className="text-base">
                    {userData?.ieltsDetails?.ieltsPlan 
                      ? format(new Date(userData.ieltsDetails.ieltsPlan), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">IELTS Exam Date</p>
                  <p className="text-base">
                    {userData?.ieltsDetails?.ieltsDate 
                      ? format(new Date(userData.ieltsDetails.ieltsDate), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Reading Score</p>
                  <p className="text-base">{userData?.ieltsDetails?.ieltsScore?.reading || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Writing Score</p>
                  <p className="text-base">{userData?.ieltsDetails?.ieltsScore?.writing || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Speaking Score</p>
                  <p className="text-base">{userData?.ieltsDetails?.ieltsScore?.speaking || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Listening Score</p>
                  <p className="text-base">{userData?.ieltsDetails?.ieltsScore?.listening || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Retaking IELTS</p>
                  <p className="text-base">{userData?.ieltsDetails?.retakingIELTS || "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div>
                <CardTitle>TOEFL Details</CardTitle>
                <CardDescription>Your TOEFL examination information</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">TOEFL Plan Date</p>
                  <p className="text-base">
                    {userData?.toeflDetails?.toeflPlan 
                      ? format(new Date(userData.toeflDetails.toeflPlan), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">TOEFL Exam Date</p>
                  <p className="text-base">
                    {userData?.toeflDetails?.toeflDate 
                      ? format(new Date(userData.toeflDetails.toeflDate), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Reading Score</p>
                  <p className="text-base">{userData?.toeflDetails?.toeflScore?.reading || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Writing Score</p>
                  <p className="text-base">{userData?.toeflDetails?.toeflScore?.writing || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Speaking Score</p>
                  <p className="text-base">{userData?.toeflDetails?.toeflScore?.speaking || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Retaking TOEFL</p>
                  <p className="text-base">{userData?.toeflDetails?.retakingTOEFL || "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visa">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Visa Details</CardTitle>
                <CardDescription>Your visa application information</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <p className="font-medium text-sm text-muted-foreground">Countries Planning to Apply</p>
                  <p className="text-base">
                    {userData?.visa?.countriesPlanningToApply && userData.visa.countriesPlanningToApply.length > 0
                      ? userData.visa.countriesPlanningToApply.join(", ")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Visa Interview Date</p>
                  <p className="text-base">
                    {userData?.visa?.visaInterviewDate 
                      ? format(new Date(userData.visa.visaInterviewDate), "MMMM d, yyyy")
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Visa Interview Location</p>
                  <p className="text-base">{userData?.visa?.visaInterviewLocation || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;