import {
  CalendarIcon,
  LocateFixedIcon,
  CalendarRangeIcon,
  FileIcon,
  BuildingIcon,
  GraduationCapIcon,
  UniversityIcon,
  WorkflowIcon,
  BaggageClaimIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  BriefcaseBusiness,
  UserIcon,
  FlagIcon,
  MapPinIcon,
  PencilIcon,
} from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useEffect, useState } from 'react';
import ProfileDetailsCard, { DataField } from '@/components/ProfileDetailsCard';
import { ListBulletIcon } from '@radix-ui/react-icons';
import SidebarHeader from '@/components/SidebarHeader';
import { getUserProfile } from '@/services/api.services';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ProfileEditForm from './components/ProfileEditForm';
import { Select } from '@/components/ui/select';

const ProfilePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // ---------- Local state ----------
  const [nameData, setNameData] = useState('');
  const [personalDetails, setPersonalDetails] = useState({ dob: '', gender: '', address: '', profession: '' });
  const [contactDetails, setContactDetails] = useState({ phoneNumber: '' });
  const [programDetails, setProgramDetails] = useState({ program: '', validity: '' });

  // School (BACHELOR)
  const [schoolDetails, setSchoolDetails] = useState({
    schoolName: '',
    board: '',
    yearOfPassing: '',
    percentage: '',
  });

  // SAT: Reading+Writing, Math, Total
  const [satDetails, setSatDetails] = useState({
    readingWriting: '',
    math: '',
    total: '',
  });

  // ACT: English, Math, Total
  const [actDetails, setActDetails] = useState({
    english: '',
    math: '',
    total: '',
  });

  // College (MASTER)
  const [collegeDetails, setCollegeDetails] = useState({
    branch: '',
    highestDegree: '',
    university: '',
    college: '',
    gpa: '',
    toppersGPA: '',
    noOfBacklogs: '',
    admissionTerm: '',
    coursesApplying: [],
  });

  // GMAT – total + quant
  const [gmatDetails, setGmatDetails] = useState({ total: '', quant: '' });

  // Duolingo – R/W/L/S like IELTS
  const [duolingoDetails, setDuolingoDetails] = useState({
    reading: '',
    writing: '',
    listening: '',
    speaking: '',
    duolingoPlan: '',
    duolingoDate: '',
    retakingDuolingo: '',
  });

  // GRE / IELTS / TOEFL / VISA
  const [greDetails, setGreDetails] = useState({
    grePlan: '',
    greDate: '',
    greScoreCard: '',
    greScore: { verbal: '', quant: '', awa: '' },
    retakingGRE: '',
  });
  const [ieltsDetails, setIeltsDetails] = useState({
    ieltsPlan: '',
    ieltsDate: '',
    ieltsScore: { reading: '', writing: '', speaking: '', listening: '' },
    retakingIELTS: '',
  });
  const [toeflDetails, setToeflDetails] = useState({
    toeflPlan: '',
    toeflDate: '',
    toeflScore: { reading: '', writing: '', speaking: '', listening: '' },
    retakingTOEFL: '',
  });
  const [visaDetails, setVisaDetails] = useState({
    countriesPlanningToApply: [],
    visaInterviewDate: '',
    visaInterviewLocation: '',
  });

  // ---------- Fetch profile ----------
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data } = await getUserProfile();
      setUserData(data);

      // Common
      setNameData(data.name || '');
      setPersonalDetails({
        dob: data.personalDetails?.dob ? new Date(data.personalDetails.dob).toISOString().split('T')[0] : '',
        gender: data.personalDetails?.gender || '',
        address: data.personalDetails?.address || '',
        profession: data.personalDetails?.profession || '',
      });
      setContactDetails({ phoneNumber: data.phoneNumber || '' });
      setProgramDetails({
        program: data.programDetails?.program || '',
        validity: data.programDetails?.validity ? new Date(data.programDetails.validity).toISOString().split('T')[0] : '',
      });

      // ---------- BACHELOR ----------
      if (data.degree === 'BACHELOR') {
        setSchoolDetails({
          schoolName: data.schoolDetails?.schoolName || '',
          board: data.schoolDetails?.board || '',
          yearOfPassing: data.schoolDetails?.yearOfPassing ?? '',
          percentage: data.schoolDetails?.percentage ?? '',
        });

        // SAT
        setSatDetails({
          readingWriting: data.satDetails?.satScore?.readingWriting?.toString() ?? '',
          math: data.satDetails?.satScore?.math?.toString() ?? '',
          total: data.satDetails?.satScore?.total?.toString() ?? '',
        });

        // ACT
        setActDetails({
          english: data.actDetails?.actScore?.english?.toString() ?? '',
          math: data.actDetails?.actScore?.math?.toString() ?? '',
          total: data.actDetails?.actScore?.total?.toString() ?? '',
        });
      }

      // ---------- MASTER ----------
      if (data.degree === 'MASTER') {
        setCollegeDetails({
          branch: data.collegeDetails?.branch || '',
          highestDegree: data.collegeDetails?.highestDegree || '',
          university: data.collegeDetails?.university || '',
          college: data.collegeDetails?.college || '',
          gpa: data.collegeDetails?.gpa ?? '',
          toppersGPA: data.collegeDetails?.toppersGPA ?? '',
          noOfBacklogs: data.collegeDetails?.noOfBacklogs ?? '',
          admissionTerm: data.collegeDetails?.admissionTerm || '',
          coursesApplying: data.collegeDetails?.coursesApplying || [],
        });

        setGmatDetails({
          total: data.gmatDetails?.gmatScore?.total?.toString() ?? '',
          quant: data.gmatDetails?.gmatScore?.quant?.toString() ?? '',
        });
      }

      // ---------- Duolingo ----------
      setDuolingoDetails({
        reading: data.duolingoDetails?.duolingoScore?.reading?.toString() ?? '',
        writing: data.duolingoDetails?.duolingoScore?.writing?.toString() ?? '',
        listening: data.duolingoDetails?.duolingoScore?.listening?.toString() ?? '',
        speaking: data.duolingoDetails?.duolingoScore?.speaking?.toString() ?? '',
        duolingoPlan: data.duolingoDetails?.duolingoPlan
          ? new Date(data.duolingoDetails.duolingoPlan).toISOString().split('T')[0]
          : '',
        duolingoDate: data.duolingoDetails?.duolingoDate
          ? new Date(data.duolingoDetails.duolingoDate).toISOString().split('T')[0]
          : '',
        retakingDuolingo: data.duolingoDetails?.retakingDuolingo || '',
      });

      // ---------- GRE ----------
      setGreDetails({
        grePlan: data.greDetails?.grePlan ? new Date(data.greDetails.grePlan).toISOString().split('T')[0] : '',
        greDate: data.greDetails?.greDate ? new Date(data.greDetails.greDate).toISOString().split('T')[0] : '',
        greScoreCard: data.greDetails?.greScoreCard || '',
        greScore: {
          verbal: data.greDetails?.greScore?.verbal ?? '',
          quant: data.greDetails?.greScore?.quant ?? '',
          awa: data.greDetails?.greScore?.awa ?? '',
        },
        retakingGRE: data.greDetails?.retakingGRE || '',
      });

      // ---------- IELTS ----------
      setIeltsDetails({
        ieltsPlan: data.ieltsDetails?.ieltsPlan ? new Date(data.ieltsDetails.ieltsPlan).toISOString().split('T')[0] : '',
        ieltsDate: data.ieltsDetails?.ieltsDate ? new Date(data.ieltsDetails.ieltsDate).toISOString().split('T')[0] : '',
        ieltsScore: {
          reading: data.ieltsDetails?.ieltsScore?.reading ?? '',
          writing: data.ieltsDetails?.ieltsScore?.writing ?? '',
          speaking: data.ieltsDetails?.ieltsScore?.speaking ?? '',
          listening: data.ieltsDetails?.ieltsScore?.listening ?? '',
        },
        retakingIELTS: data.ieltsDetails?.retakingIELTS || '',
      });

      // ---------- TOEFL ----------
      setToeflDetails({
        toeflPlan: data.toeflDetails?.toeflPlan ? new Date(data.toeflDetails.toeflPlan).toISOString().split('T')[0] : '',
        toeflDate: data.toeflDetails?.toeflDate ? new Date(data.toeflDetails.toeflDate).toISOString().split('T')[0] : '',
        toeflScore: {
          reading: data.toeflDetails?.toeflScore?.reading ?? '',
          writing: data.toeflDetails?.toeflScore?.writing ?? '',
          speaking: data.toeflDetails?.toeflScore?.speaking ?? '',
          listening: data.toeflDetails?.toeflScore?.listening ?? '',
        },
        retakingTOEFL: data.toeflDetails?.retakingTOEFL || '',
      });

      // ---------- VISA ----------
      setVisaDetails({
        countriesPlanningToApply: data.visa?.countriesPlanningToApply || [],
        visaInterviewDate: data.visa?.visaInterviewDate ? new Date(data.visa.visaInterviewDate).toISOString().split('T')[0] : '',
        visaInterviewLocation: data.visa?.visaInterviewLocation || '',
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ---------- Handlers ----------
  const handleNameChange = (field, value) => setNameData(value);
  const handlePersonalDetailsChange = (field, value) =>
    setPersonalDetails((p) => ({ ...p, [field]: value }));
  const handleContactDetailsChange = (field, value) =>
    setContactDetails((p) => ({ ...p, [field]: value }));
  const handleProgramDetailsChange = (field, value) =>
    setProgramDetails((p) => ({ ...p, [field]: value }));
  const handleCollegeDetailsChange = (field, value) => {
    if (field === 'coursesApplying') {
      const arr = typeof value === 'string' ? value.split(',').map((c) => c.trim()) : value;
      setCollegeDetails((p) => ({ ...p, [field]: arr }));
    } else {
      setCollegeDetails((p) => ({ ...p, [field]: value }));
    }
  };
  const handleSchoolDetailsChange = (field, value) =>
    setSchoolDetails((p) => ({ ...p, [field]: value }));
  const handleGreDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setGreDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setGreDetails((p) => ({ ...p, [field]: value }));
    }
  };
  const handleIeltsDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setIeltsDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setIeltsDetails((p) => ({ ...p, [field]: value }));
    }
  };
  const handleToeflDetailsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setToeflDetails((p) => ({ ...p, [parent]: { ...p[parent], [child]: value } }));
    } else {
      setToeflDetails((p) => ({ ...p, [field]: value }));
    }
  };
  const handleVisaDetailsChange = (field, value) => {
    if (field === 'countriesPlanningToApply') {
      const arr = typeof value === 'string' ? value.split(',').map((c) => c.trim()) : value.map((i) => i.value);
      setVisaDetails((p) => ({ ...p, [field]: arr }));
    } else {
      setVisaDetails((p) => ({ ...p, [field]: value }));
    }
  };

  const handleCloseEditMode = () => setEditMode(false);
  const handleSuccess = async () => {
    await fetchUserProfile();
    setEditMode(false);
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar isSidebarOpen={isOpen} />
          <SidebarInset>
            <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="p-5 flex justify-center items-center min-h-[80vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Loading profile data...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar isSidebarOpen={isOpen} />
          <SidebarInset>
            <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="p-5 flex justify-center items-center min-h-[80vh]">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <button
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (editMode) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar isSidebarOpen={isOpen} />
          <SidebarInset>
            <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="p-5">
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
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const isMaster = userData?.degree === 'MASTER';
  const isBachelor = userData?.degree === 'BACHELOR';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar isSidebarOpen={isOpen} />
        <SidebarInset>
          <SidebarHeader isSidebarOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="p-5">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">View and manage your profile information</p>
              </div>
              <Button onClick={() => setEditMode(true)} className="bg-primary hover:bg-primary/90">
                <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 ">
              {/* ────────────────────── 1. Profile + Program + Contact ────────────────────── */}
              <div className="sm:col-span-1 lg:col-span-4 max-w-600px">
                <div className="bg-white rounded-lg shadow-sm p-2 h-full min-h-[280px] ">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow  ">
                    {/* Profile picture */}
                    <div className="lg:col-span-5 flex items-center justify-center">
                      <div className="relative w-full aspect-square max-w-[180px] mx-auto">
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-md border-2 border-gray-200">
                          {userData?.profilePicture ? (
                            <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <p className="text-gray-500 text-sm text-center px-4">No profile image</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Program + Contact (side-by-side) */}
                    <div className="lg:col-span-7 flex flex-col sm:flex-row  justify-between space-y-4">
                      <ProfileDetailsCard title="Program Details" canEdit={false} className="border-0 shadow-none flex-1  ">
                        <DataField icon={<BriefcaseBusiness className="w-5 h-5  " fill="#002b56" />} label="Program" value={programDetails.program} />
                        <DataField icon={<ClockIcon className="w-5 h-5" />} label="Validity" value={programDetails.validity} />
                      </ProfileDetailsCard>

                      <ProfileDetailsCard title="Contact Details" canEdit={false} className="border-0 shadow-none flex-1 ">
                        <DataField icon={<PhoneIcon className="w-5 h-5" />} label="Phone" value={contactDetails.phoneNumber || 'Not set'} />
                        <DataField icon={<MailIcon className="w-5 h-5" />} label="E-mail" value={userData?.email || 'Not set'} />
                      </ProfileDetailsCard>
                    </div>
                  </div>
                </div>
              </div>
              {/* ────────────────────── 2. Personal Details ────────────────────── */}
              <div className="sm:col-span-1 lg:col-span-4">   {/* ← changed from 3 to 4 */}
                <ProfileDetailsCard title="Personal Details" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <DataField icon={<UserIcon className="w-5 h-5" />} label="Name" value={nameData} />
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date of Birth" value={personalDetails.dob} fieldType="date" />
                    <DataField icon={<BaggageClaimIcon className="w-5 h-5" />} label="Gender" value={personalDetails.gender} />
                    <DataField icon={<LocateFixedIcon className="w-5 h-5" />} label="Address" value={personalDetails.address} />
                    <DataField icon={<WorkflowIcon className="w-5 h-5" />} label="Profession" value={personalDetails.profession} />
                  </div>
                </ProfileDetailsCard>
              </div>

              {(isBachelor || isMaster) && (
                <div className="sm:col-span-1 lg:col-span-4">   {/* ← changed from 5 to 4 */}
                  <ProfileDetailsCard
                    title={isBachelor ? 'School Details' : 'College Details'}
                    canEdit={false}
                    className="h-full min-h-[280px]"
                  >
                    {isBachelor ? (
                      <div className="space-y-5">
                        <DataField icon={<BuildingIcon className="w-5 h-5" />} label="School Name" value={schoolDetails.schoolName} />
                        <DataField icon={<GraduationCapIcon className="w-5 h-5" />} label="Board" value={schoolDetails.board} />
                        <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Year of Passing" value={schoolDetails.yearOfPassing} />
                        <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="Percentage" value={schoolDetails.percentage} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-5">
                          <DataField icon={<GraduationCapIcon className="w-5 h-5" />} label="Branch" value={collegeDetails.branch} />
                          <DataField icon={<UniversityIcon className="w-5 h-5" />} label="University" value={collegeDetails.university} />
                          <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="GPA" value={collegeDetails.gpa} />
                          <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="Toppers GPA" value={collegeDetails.toppersGPA} />
                          <DataField icon={<ListBulletIcon className="w-5 h-5" />} label="Backlogs" value={collegeDetails.noOfBacklogs} />
                        </div>
                        <div className="space-y-5">
                          <DataField icon={<GraduationCapIcon className="w-5 h-5" />} label="Highest Degree" value={collegeDetails.highestDegree} />
                          <DataField icon={<BuildingIcon className="w-5 h-5" />} label="College" value={collegeDetails.college} />
                          <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Admission Term" value={collegeDetails.admissionTerm} />
                          <DataField icon={<FileIcon className="w-5 h-5" />} label="Courses Applying" value={collegeDetails.coursesApplying.join(', ')} />
                        </div>
                      </div>
                    )}
                  </ProfileDetailsCard>
                </div>
              )}


              {/* ---- SAT (Original UI) ---- */}
              {isBachelor && (satDetails.readingWriting || satDetails.math || satDetails.total) && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="SAT" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Reading + Writing</div>
                          <input type="number" value={satDetails.readingWriting} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Math</div>
                          <input type="number" value={satDetails.math} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="text-center pt-3 border-t">
                        <div className="text-2xl font-bold text-primary">{satDetails.total}</div>
                        {/* <p className="text-xs text-gray-600">Total / 1600</p> */}
                      </div>
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* ---- ACT (Original UI) ---- */}
              {isBachelor && (actDetails.english || actDetails.math || actDetails.total) && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="ACT" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>English</div>
                          <input type="number" value={actDetails.english} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Math</div>
                          <input type="number" value={actDetails.math} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="text-center pt-3 border-t">
                        <div className="text-2xl font-bold text-primary">{actDetails.total}</div>
                        {/* <p className="text-xs text-gray-600">Composite / 36</p> */}
                      </div>
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* ---- GMAT (MASTER) ---- */}
              {isMaster && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="GMAT" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Total Score</div>
                          <input type="number" value={gmatDetails.total} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Quantitative</div>
                          <input type="number" value={gmatDetails.quant} disabled className="w-full border rounded px-2 py-1 text-sm bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* ---- Duolingo – EXACTLY LIKE IELTS (NO COLORS) ---- */}
              {(isBachelor || isMaster) && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="Duolingo" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={duolingoDetails.duolingoPlan} fieldType="date" />
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={duolingoDetails.duolingoDate} fieldType="date" />
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>Duolingo Score</div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                              <div className="text-gray-500">Reading</div>
                              <input type="number" value={duolingoDetails.reading} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">Writing</div>
                              <input type="number" value={duolingoDetails.writing} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">Speaking</div>
                              <input type="number" value={duolingoDetails.speaking} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">Listening</div>
                              <input type="number" value={duolingoDetails.listening} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>

                          </div>
                        </div>
                      </div>
                      <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={duolingoDetails.retakingDuolingo} />
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* ---- GRE (MASTER) ---- */}
              {isMaster && (
                <div className="sm:col-span-1 lg:col-span-4">
                  <ProfileDetailsCard title="GRE" canEdit={false} className="h-full min-h-[280px]">
                    <div className="space-y-5">
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={greDetails.grePlan} fieldType="date" />
                      <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={greDetails.greDate} fieldType="date" />
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                          <ListBulletIcon className="w-5 h-5 stroke-white" />
                        </div>
                        <div>
                          <div>GRE Score</div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="text-gray-500">Verbal</div>
                              <input type="number" value={greDetails.greScore.verbal} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">Quant</div>
                              <input type="number" value={greDetails.greScore.quant} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                            <div>
                              <div className="text-gray-500">AWA</div>
                              <input type="number" value={greDetails.greScore.awa} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <DataField icon={<FileIcon className="w-5 h-5" />} label="Scorecard" value={greDetails.greScoreCard} />
                      <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={greDetails.retakingGRE} />
                    </div>
                  </ProfileDetailsCard>
                </div>
              )}

              {/* ---- IELTS ---- */}
              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard title="IELTS" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={ieltsDetails.ieltsPlan} fieldType="date" />
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={ieltsDetails.ieltsDate} fieldType="date" />
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                        <ListBulletIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div>
                        <div>IELTS Score</div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">Reading</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.reading} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">Writing</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.writing} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">Speaking</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.speaking} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">Listening</div>
                            <input type="number" step="0.5" value={ieltsDetails.ieltsScore.listening} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={ieltsDetails.retakingIELTS} />
                  </div>
                </ProfileDetailsCard>
              </div>

              {/* ---- TOEFL ---- */}
              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard title="TOEFL" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Plan" value={toeflDetails.toeflPlan} fieldType="date" />
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Date" value={toeflDetails.toeflDate} fieldType="date" />
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                        <ListBulletIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div>
                        <div>TOEFL Score</div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">Reading</div>
                            <input type="number" value={toeflDetails.toeflScore.reading} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">Writing</div>
                            <input type="number" value={toeflDetails.toeflScore.writing} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">Speaking</div>
                            <input type="number" value={toeflDetails.toeflScore.speaking} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                          <div>
                            <div className="text-gray-500">Listening</div>
                            <input type="number" value={toeflDetails.toeflScore.listening} disabled className="w-full border rounded px-2 py-1 bg-gray-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DataField icon={<CalendarRangeIcon className="w-5 h-5" />} label="Retaking" value={toeflDetails.retakingTOEFL} />
                  </div>
                </ProfileDetailsCard>
              </div>

              {/* ---- VISA ---- */}
              <div className="sm:col-span-1 lg:col-span-4">
                <ProfileDetailsCard title="VISA" canEdit={false} className="h-full min-h-[280px]">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">
                        <FlagIcon className="w-5 h-5 stroke-white" />
                      </div>
                      <div className="flex-grow">
                        <div>Countries</div>
                        <Select
                          isMulti
                          value={visaDetails.countriesPlanningToApply.map((c) => ({ value: c, label: c }))}
                          options={[
                            { value: 'USA', label: 'USA' },
                            { value: 'CANADA', label: 'Canada' },
                            { value: 'UK', label: 'UK' },
                            { value: 'AUSTRALIA', label: 'Australia' },
                            { value: 'GERMANY', label: 'Germany' },
                            { value: 'FRANCE', label: 'France' },
                          ]}
                          className="w-full text-sm"
                          classNamePrefix="select"
                          isDisabled
                        />
                      </div>
                    </div>
                    <DataField icon={<CalendarIcon className="w-5 h-5" />} label="Interview Date" value={visaDetails.visaInterviewDate} fieldType="date" />
                    <DataField icon={<MapPinIcon className="w-5 h-5" />} label="Location" value={visaDetails.visaInterviewLocation} />
                  </div>
                </ProfileDetailsCard>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;