// src/components/ProfileEditForm.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserProfile, uploadFile } from '@/services/api.services';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

const validatePhoneNumber = (number) => /^\+\d{2,3}\d{10}$/.test(number);

const formatPhoneNumber = (number) => {
  if (!number) return '';
  const cleaned = number.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') ? cleaned : '+91' + cleaned;
};

const safeDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const dateToISOString = (dateStr) => (!dateStr ? null : new Date(dateStr).toISOString());

const fallback = (v, fb = '') => v || fb;
const toNum = (v) => (isNaN(Number(v)) ? 0 : Number(v));
const strToArr = (s) => (s && typeof s === 'string' ? s.split(',').map((i) => i.trim()).filter(Boolean) : Array.isArray(s) ? s : []);

const ProfileEditForm = ({ userData, onClose, onSuccess }) => {
  const isBachelor = userData?.degree === 'BACHELOR';
  const isMaster = userData?.degree === 'MASTER';
console.log(userData.degree)
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phoneNumber: userData?.phoneNumber || '',
    profilePicture: userData?.profilePicture || '',
    personalDetails: {
      dob: safeDate(userData?.personalDetails?.dob),
      gender: userData?.personalDetails?.gender || '',
      address: userData?.personalDetails?.address || '',
      profession: userData?.personalDetails?.profession || '',
    },
    programDetails: {
      program: userData?.programDetails?.program || '',
      validity: safeDate(userData?.programDetails?.validity),
    },

    // ---------- BACHELOR ----------
    schoolDetails: isBachelor
      ? {
          schoolName: userData?.schoolDetails?.schoolName || '',
          board: userData?.schoolDetails?.board || '',
          yearOfPassing: userData?.schoolDetails?.yearOfPassing || '',
          percentage: userData?.schoolDetails?.percentage || '',
        }
      : {},
    satDetails: isBachelor
      ? {
          readingWriting: userData?.satDetails?.satScore?.readingWriting ?? '',
          math: userData?.satDetails?.satScore?.math ?? '',
          total: userData?.satDetails?.satScore?.total ?? '',
        }
      : {},
    actDetails: isBachelor
      ? {
          english: userData?.actDetails?.actScore?.english ?? '',
          math: userData?.actDetails?.actScore?.math ?? '',
          total: userData?.actDetails?.actScore?.total ?? '',
        }
      : {},

    // ---------- MASTER ----------
    collegeDetails: isMaster
      ? {
          branch: userData?.collegeDetails?.branch || '',
          highestDegree: userData?.collegeDetails?.highestDegree || '',
          university: userData?.collegeDetails?.university || '',
          college: userData?.collegeDetails?.college || '',
          gpa: userData?.collegeDetails?.gpa ?? '',
          toppersGPA: userData?.collegeDetails?.toppersGPA ?? '',
          noOfBacklogs: userData?.collegeDetails?.noOfBacklogs ?? '',
          admissionTerm: userData?.collegeDetails?.admissionTerm || '',
          coursesApplying: userData?.collegeDetails?.coursesApplying?.join(', ') || '',
        }
      : {},
    gmatDetails: isMaster
      ? {
          total: userData?.gmatDetails?.gmatScore?.total ?? '',
          quant: userData?.gmatDetails?.gmatScore?.quant ?? '',
        }
      : {},

    // ---------- COMMON ----------
    duolingoDetails: {
      duolingoPlan: safeDate(userData?.duolingoDetails?.duolingoPlan),
      duolingoDate: safeDate(userData?.duolingoDetails?.duolingoDate),
      duolingoScore: {
        reading: userData?.duolingoDetails?.duolingoScore?.reading ?? '',
        writing: userData?.duolingoDetails?.duolingoScore?.writing ?? '',
        listening: userData?.duolingoDetails?.duolingoScore?.listening ?? '',
        speaking: userData?.duolingoDetails?.duolingoScore?.speaking ?? '',
      },
      retakingDuolingo: userData?.duolingoDetails?.retakingDuolingo || '',
    },
    greDetails: {
      grePlan: safeDate(userData?.greDetails?.grePlan),
      greDate: safeDate(userData?.greDetails?.greDate),
      greScore: {
        verbal: userData?.greDetails?.greScore?.verbal ?? '',
        quant: userData?.greDetails?.greScore?.quant ?? '',
        awa: userData?.greDetails?.greScore?.awa ?? '',
      },
      retakingGRE: userData?.greDetails?.retakingGRE || '',
    },
    ieltsDetails: {
      ieltsPlan: safeDate(userData?.ieltsDetails?.ieltsPlan),
      ieltsDate: safeDate(userData?.ieltsDetails?.ieltsDate),
      ieltsScore: {
        reading: userData?.ieltsDetails?.ieltsScore?.reading ?? '',
        writing: userData?.ieltsDetails?.ieltsScore?.writing ?? '',
        speaking: userData?.ieltsDetails?.ieltsScore?.speaking ?? '',
        listening: userData?.ieltsDetails?.ieltsScore?.listening ?? '',
      },
      retakingIELTS: userData?.ieltsDetails?.retakingIELTS || '',
    },
    toeflDetails: {
      toeflPlan: safeDate(userData?.toeflDetails?.toeflPlan),
      toeflDate: safeDate(userData?.toeflDetails?.toeflDate),
      toeflScore: {
        reading: userData?.toeflDetails?.toeflScore?.reading ?? '',
        writing: userData?.toeflDetails?.toeflScore?.writing ?? '',
        speaking: userData?.toeflDetails?.toeflScore?.speaking ?? '',
        listening: userData?.toeflDetails?.toeflScore?.listening ?? '',
      },
      retakingTOEFL: userData?.toeflDetails?.retakingTOEFL || '',
    },
    visa: {
      countriesPlanningToApply: userData?.visa?.countriesPlanningToApply?.join(', ') || '',
      visaInterviewDate: safeDate(userData?.visa?.visaInterviewDate),
      visaInterviewLocation: userData?.visa?.visaInterviewLocation || '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // -------------------------------------------------------------------------
  // Generic change handler (supports nested paths like greScore.verbal)
  // -------------------------------------------------------------------------
  const handleChange = (section, field, value) => {
    if (!section) {
      setFormData((p) => ({ ...p, [field]: value }));
      return;
    }
    if (field.includes('.')) {
      const [sub, subField] = field.split('.');
      setFormData((p) => ({
        ...p,
        [section]: {
          ...p[section],
          [sub]: { ...p[section][sub], [subField]: value },
        },
      }));
    } else {
      setFormData((p) => ({
        ...p,
        [section]: { ...p[section], [field]: value },
      }));
    }
  };

  // -------------------------------------------------------------------------
  // Phone number formatting
  // -------------------------------------------------------------------------
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (!formatted || formatted === '+' || validatePhoneNumber(formatted) || formatted.length <= 13) {
      handleChange(null, 'phoneNumber', formatted);
    }
  };

  // -------------------------------------------------------------------------
  // Image upload
  // -------------------------------------------------------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const valid = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!valid.includes(file.type)) return toast.error('Invalid image type');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image ≤ 5 MB');

    try {
      setImageUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'profile');
      const { data } = await uploadFile(fd);
      if (data?.url) {
        setFormData((p) => ({ ...p, profilePicture: data.url }));
        toast.success('Image uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhoneNumber(formData.phoneNumber))
      return toast.error('Phone must be +CountryCode + 10 digits');
    // if (!formData.personalDetails.gender) return toast.error('Select gender');

    setLoading(true);
    try {
      const payload = {
        name: fallback(formData.name),
        email: userData?.email,
        phoneNumber: fallback(formData.phoneNumber),
        profilePicture: formData.profilePicture,
        personalDetails: {
          dob: dateToISOString(formData.personalDetails.dob),
          gender: fallback(formData.personalDetails.gender),
          address: fallback(formData.personalDetails.address),
          profession: fallback(formData.personalDetails.profession),
        },
        programDetails: {
          program: fallback(formData.programDetails.program),
          validity: dateToISOString(formData.programDetails.validity),
        },

        // BACHELOR
        ...(isBachelor && {
          schoolDetails: {
            schoolName: fallback(formData.schoolDetails.schoolName),
            board: fallback(formData.schoolDetails.board),
            yearOfPassing: fallback(formData.schoolDetails.yearOfPassing),
            percentage: fallback(formData.schoolDetails.percentage),
          },
          satDetails: {
            satScore: {
              readingWriting: toNum(formData.satDetails.readingWriting),
              math: toNum(formData.satDetails.math),
              total: toNum(formData.satDetails.total),
            },
          },
          actDetails: {
            actScore: {
              english: toNum(formData.actDetails.english),
              math: toNum(formData.actDetails.math),
              total: toNum(formData.actDetails.total),
            },
          },
        }),

        // MASTER
        ...(isMaster && {
          collegeDetails: {
            branch: fallback(formData.collegeDetails.branch),
            highestDegree: fallback(formData.collegeDetails.highestDegree),
            university: fallback(formData.collegeDetails.university),
            college: fallback(formData.collegeDetails.college),
            gpa: toNum(formData.collegeDetails.gpa),
            toppersGPA: toNum(formData.collegeDetails.toppersGPA),
            noOfBacklogs: toNum(formData.collegeDetails.noOfBacklogs),
            admissionTerm: fallback(formData.collegeDetails.admissionTerm),
            coursesApplying: strToArr(formData.collegeDetails.coursesApplying),
          },
          gmatDetails: {
            gmatScore: {
              total: toNum(formData.gmatDetails.total),
              quant: toNum(formData.gmatDetails.quant),
            },
          },
        }),

        // COMMON
        duolingoDetails: {
          duolingoPlan: dateToISOString(formData.duolingoDetails.duolingoPlan),
          duolingoDate: dateToISOString(formData.duolingoDetails.duolingoDate),
          duolingoScore: {
            reading: toNum(formData.duolingoDetails.duolingoScore.reading),
            writing: toNum(formData.duolingoDetails.duolingoScore.writing),
            listening: toNum(formData.duolingoDetails.duolingoScore.listening),
            speaking: toNum(formData.duolingoDetails.duolingoScore.speaking),
          },
          retakingDuolingo: fallback(formData.duolingoDetails.retakingDuolingo, 'No'),
        },
        greDetails: {
          grePlan: dateToISOString(formData.greDetails.grePlan),
          greDate: dateToISOString(formData.greDetails.greDate),
          greScore: {
            verbal: toNum(formData.greDetails.greScore.verbal),
            quant: toNum(formData.greDetails.greScore.quant),
            awa: toNum(formData.greDetails.greScore.awa),
          },
          retakingGRE: fallback(formData.greDetails.retakingGRE, 'No'),
        },
        ieltsDetails: {
          ieltsPlan: dateToISOString(formData.ieltsDetails.ieltsPlan),
          ieltsDate: dateToISOString(formData.ieltsDetails.ieltsDate),
          ieltsScore: {
            reading: toNum(formData.ieltsDetails.ieltsScore.reading),
            writing: toNum(formData.ieltsDetails.ieltsScore.writing),
            speaking: toNum(formData.ieltsDetails.ieltsScore.speaking),
            listening: toNum(formData.ieltsDetails.ieltsScore.listening),
          },
          retakingIELTS: fallback(formData.ieltsDetails.retakingIELTS, 'No'),
        },
        toeflDetails: {
          toeflPlan: dateToISOString(formData.toeflDetails.toeflPlan),
          toeflDate: dateToISOString(formData.toeflDetails.toeflDate),
          toeflScore: {
            reading: toNum(formData.toeflDetails.toeflScore.reading),
            writing: toNum(formData.toeflDetails.toeflScore.writing),
            speaking: toNum(formData.toeflDetails.toeflScore.speaking),
            listening: toNum(formData.toeflDetails.toeflScore.listening),
          },
          retakingTOEFL: fallback(formData.toeflDetails.retakingTOEFL, 'No'),
        },
        visa: {
          countriesPlanningToApply: strToArr(formData.visa.countriesPlanningToApply),
          visaInterviewDate: dateToISOString(formData.visa.visaInterviewDate),
          visaInterviewLocation: fallback(formData.visa.visaInterviewLocation),
        },
      };

      const { success } = await updateUserProfile(payload);
      if (success) {
        toast.success('Profile updated');
        onSuccess?.();
        onClose?.();
        // window.location.reload();
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-8 pr-2">
      {/* ---------- Profile Image ---------- */}
      <Card>
        <CardHeader><CardTitle>Profile Image</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              <img src={formData.profilePicture || ''} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <Button
              variant="outline"
              type="button"
              disabled={imageUploading}
              onClick={() => document.getElementById('profileImg').click()}
              className="gap-2"
            >
              {imageUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Change Photo
                </>
              )}
            </Button>
            <input id="profileImg" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        </CardContent>
      </Card>

      {/* ---------- Personal Information ---------- */}
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange(null, 'name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userData?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phoneNumber} onChange={handlePhoneChange} placeholder="+91XXXXXXXXXX" />
              <p className="text-xs text-muted-foreground">e.g. +918388656625</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input type="date" id="dob" value={formData.personalDetails.dob} onChange={(e) => handleChange('personalDetails', 'dob', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.personalDetails.gender} onValueChange={(v) => handleChange('personalDetails', 'gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input id="profession" value={formData.personalDetails.profession} onChange={(e) => handleChange('personalDetails', 'profession', e.target.value)} />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={3} value={formData.personalDetails.address} onChange={(e) => handleChange('personalDetails', 'address', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Program Details ---------- */}
      <Card>
        <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Input id="program" value={formData.programDetails.program} onChange={(e) => handleChange('programDetails', 'program', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validity">Validity</Label>
            <Input type="date" id="validity" value={formData.programDetails.validity} onChange={(e) => handleChange('programDetails', 'validity', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* ---------- BACHELOR ONLY ---------- */}
      {isBachelor && (
        <>
          {/* School */}
          <Card>
            <CardHeader><CardTitle>School Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input id="schoolName" value={formData.schoolDetails.schoolName} onChange={(e) => handleChange('schoolDetails', 'schoolName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Input id="board" value={formData.schoolDetails.board} onChange={(e) => handleChange('schoolDetails', 'board', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yop">Year of Passing</Label>
                <Input id="yop" value={formData.schoolDetails.yearOfPassing} onChange={(e) => handleChange('schoolDetails', 'yearOfPassing', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percent">Percentage</Label>
                <Input id="percent" value={formData.schoolDetails.percentage} onChange={(e) => handleChange('schoolDetails', 'percentage', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* SAT */}
          <Card>
            <CardHeader><CardTitle>SAT</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="satRW">Reading + Writing</Label>
                <Input id="satRW" type="number" value={formData.satDetails.readingWriting} onChange={(e) => handleChange('satDetails', 'readingWriting', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satMath">Math</Label>
                <Input id="satMath" type="number" value={formData.satDetails.math} onChange={(e) => handleChange('satDetails', 'math', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satTotal">Total</Label>
                <Input id="satTotal" type="number" value={formData.satDetails.total} onChange={(e) => handleChange('satDetails', 'total', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* ACT */}
          <Card>
            <CardHeader><CardTitle>ACT</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actEng">English</Label>
                <Input id="actEng" type="number" value={formData.actDetails.english} onChange={(e) => handleChange('actDetails', 'english', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actMath">Math</Label>
                <Input id="actMath" type="number" value={formData.actDetails.math} onChange={(e) => handleChange('actDetails', 'math', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actTotal">Total</Label>
                <Input id="actTotal" type="number" value={formData.actDetails.total} onChange={(e) => handleChange('actDetails', 'total', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ---------- MASTER ONLY ---------- */}
      {isMaster && (
        <>
          {/* College */}
          <Card>
            <CardHeader><CardTitle>College Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={formData.collegeDetails.branch} onChange={(e) => handleChange('collegeDetails', 'branch', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highestDegree">Highest Degree</Label>
                <Input id="highestDegree" value={formData.collegeDetails.highestDegree} onChange={(e) => handleChange('collegeDetails', 'highestDegree', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input id="university" value={formData.collegeDetails.university} onChange={(e) => handleChange('collegeDetails', 'university', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input id="college" value={formData.collegeDetails.college} onChange={(e) => handleChange('collegeDetails', 'college', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input id="gpa" type="number" step="0.01" value={formData.collegeDetails.gpa} onChange={(e) => handleChange('collegeDetails', 'gpa', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toppersGPA">Topper&apos;s GPA</Label>
                <Input id="toppersGPA" type="number" step="0.01" value={formData.collegeDetails.toppersGPA} onChange={(e) => handleChange('collegeDetails', 'toppersGPA', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backlogs">Backlogs</Label>
                <Input id="backlogs" type="number" value={formData.collegeDetails.noOfBacklogs} onChange={(e) => handleChange('collegeDetails', 'noOfBacklogs', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionTerm">Admission Term</Label>
                <Input id="admissionTerm" value={formData.collegeDetails.admissionTerm} onChange={(e) => handleChange('collegeDetails', 'admissionTerm', e.target.value)} />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label htmlFor="coursesApplying">Courses Applying (comma separated)</Label>
                <Textarea id="coursesApplying" rows={2} value={formData.collegeDetails.coursesApplying} onChange={(e) => handleChange('collegeDetails', 'coursesApplying', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* GMAT */}
          {userData.degree === "MASTER" && (
             <Card>
            <CardHeader><CardTitle>GMAT</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gmatTotal">Total</Label>
                <Input id="gmatTotal" type="number" value={formData.gmatDetails.total} onChange={(e) => handleChange('gmatDetails', 'total', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gmatQuant">Quantitative</Label>
                <Input id="gmatQuant" type="number" value={formData.gmatDetails.quant} onChange={(e) => handleChange('gmatDetails', 'quant', e.target.value)} />
              </div>
            </CardContent>
          </Card>
          )}
         
        </>
      )}

      {/* ---------- COMMON SECTIONS (Duolingo, GRE, IELTS, TOEFL, Visa) ---------- */}
      {/* Duolingo */}
      <Card>
        <CardHeader><CardTitle>Duolingo</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duoPlan">Plan Date</Label>
            <Input type="date" id="duoPlan" value={formData.duolingoDetails.duolingoPlan} onChange={(e) => handleChange('duolingoDetails', 'duolingoPlan', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duoDate">Exam Date</Label>
            <Input type="date" id="duoDate" value={formData.duolingoDetails.duolingoDate} onChange={(e) => handleChange('duolingoDetails', 'duolingoDate', e.target.value)} />
          </div>
          {['reading', 'writing', 'listening', 'speaking'].map((band) => (
            <div key={band} className="space-y-2">
              <Label htmlFor={`duo${band}`}>{band.charAt(0).toUpperCase() + band.slice(1)}</Label>
              <Input id={`duo${band}`} type="number" step="0.5" value={formData.duolingoDetails.duolingoScore[band]} onChange={(e) => handleChange('duolingoDetails', `duolingoScore.${band}`, e.target.value)} />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="retakeDuo">Retaking</Label>
            <Select value={formData.duolingoDetails.retakingDuolingo} onValueChange={(v) => handleChange('duolingoDetails', 'retakingDuolingo', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* GRE */}
         {userData.degree === "MASTER" && (
     <Card>
        <CardHeader><CardTitle>GRE</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grePlan">Plan Date</Label>
            <Input type="date" id="grePlan" value={formData.greDetails.grePlan} onChange={(e) => handleChange('greDetails', 'grePlan', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="greDate">Exam Date</Label>
            <Input type="date" id="greDate" value={formData.greDetails.greDate} onChange={(e) => handleChange('greDetails', 'greDate', e.target.value)} />
          </div>
          {['verbal', 'quant', 'awa'].map((s) => (
            <div key={s} className="space-y-2">
              <Label htmlFor={`gre${s}`}>{s.toUpperCase()}</Label>
              <Input id={`gre${s}`} type="number" step={s === 'awa' ? '0.5' : '1'} value={formData.greDetails.greScore[s]} onChange={(e) => handleChange('greDetails', `greScore.${s}`, e.target.value)} />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="retakeGRE">Retaking</Label>
            <Select value={formData.greDetails.retakingGRE} onValueChange={(v) => handleChange('greDetails', 'retakingGRE', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
         )}
 

      {/* IELTS */}
      <Card>
        <CardHeader><CardTitle>IELTS</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ieltsPlan">Plan Date</Label>
            <Input type="date" id="ieltsPlan" value={formData.ieltsDetails.ieltsPlan} onChange={(e) => handleChange('ieltsDetails', 'ieltsPlan', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ieltsDate">Exam Date</Label>
            <Input type="date" id="ieltsDate" value={formData.ieltsDetails.ieltsDate} onChange={(e) => handleChange('ieltsDetails', 'ieltsDate', e.target.value)} />
          </div>
          {['reading', 'writing', 'speaking', 'listening'].map((band) => (
            <div key={band} className="space-y-2">
              <Label htmlFor={`ielts${band}`}>{band.charAt(0).toUpperCase() + band.slice(1)}</Label>
              <Input id={`ielts${band}`} type="number" step="0.5" value={formData.ieltsDetails.ieltsScore[band]} onChange={(e) => handleChange('ieltsDetails', `ieltsScore.${band}`, e.target.value)} />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="retakeIELTS">Retaking</Label>
            <Select value={formData.ieltsDetails.retakingIELTS} onValueChange={(v) => handleChange('ieltsDetails', 'retakingIELTS', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* TOEFL */}
      <Card>
        <CardHeader><CardTitle>TOEFL</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="toeflPlan">Plan Date</Label>
            <Input type="date" id="toeflPlan" value={formData.toeflDetails.toeflPlan} onChange={(e) => handleChange('toeflDetails', 'toeflPlan', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toeflDate">Exam Date</Label>
            <Input type="date" id="toeflDate" value={formData.toeflDetails.toeflDate} onChange={(e) => handleChange('toeflDetails', 'toeflDate', e.target.value)} />
          </div>
          {['reading', 'writing', 'speaking', 'listening'].map((band) => (
            <div key={band} className="space-y-2">
              <Label htmlFor={`toefl${band}`}>{band.charAt(0).toUpperCase() + band.slice(1)}</Label>
              <Input id={`toefl${band}`} type="number" value={formData.toeflDetails.toeflScore[band]} onChange={(e) => handleChange('toeflDetails', `toeflScore.${band}`, e.target.value)} />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="retakeTOEFL">Retaking</Label>
            <Select value={formData.toeflDetails.retakingTOEFL} onValueChange={(v) => handleChange('toeflDetails', 'retakingTOEFL', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visa */}
      <Card>
        <CardHeader><CardTitle>Visa Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label htmlFor="countries">Countries (comma separated)</Label>
            <Textarea id="countries" rows={2} value={formData.visa.countriesPlanningToApply} onChange={(e) => handleChange('visa', 'countriesPlanningToApply', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visaInterview">Interview Date</Label>
            <Input type="date" id="visaInterview" value={formData.visa.visaInterviewDate} onChange={(e) => handleChange('visa', 'visaInterviewDate', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visaLocation">Location</Label>
            <Input id="visaLocation" value={formData.visa.visaInterviewLocation} onChange={(e) => handleChange('visa', 'visaInterviewLocation', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* ---------- Buttons ---------- */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-primary">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
};

ProfileEditForm.propTypes = {
  userData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ProfileEditForm;