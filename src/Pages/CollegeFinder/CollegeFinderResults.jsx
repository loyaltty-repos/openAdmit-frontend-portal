// src/pages/college-finder/CollegeFinderResults.jsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Navigation from '@/components/static/Navigation';
import Footer from '@/components/static/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getAssignedUniversities, getUserProfile, updateUserProfile } from '@/services/api.services';
import { isAuthenticated, getUser } from '@/lib/auth';
import { toast } from 'sonner';
import {
  MapPin,
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Shield,
  ArrowLeft,
  Download,
  Brain,
  Loader2,
  Trophy,
  Sparkles,
  Zap,
  User,
  Cake,
  Users2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const CACHE_KEY_PREFIX = 'college_finder_cache_';

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
    if (!text) return;

    const interval = setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next <= text.length) {
          setDisplayedText(text.slice(0, next));
          return next;
        }
        clearInterval(interval);
        return i;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <h2 className="text-xl text-center max-w-2xl px-6 font-medium text-gray-800 leading-relaxed">
      <span>{displayedText}</span>
      {index < text.length && <span className="inline-block w-0.5 h-7 bg-primary-600 ml-1 animate-pulse align-middle" />}
    </h2>
  );
};

const ProfileCompletionModal = React.memo(function ProfileCompletionModal({
  open,
  onClose,
  form,
  setForm,
  step,
  setStep,
  errors,
  setErrors,
  onSubmit,
}) {
  const steps = [
    { icon: User, title: 'Your Name', desc: 'Verify or update your name' },
    { icon: Cake, title: 'Date of Birth', desc: 'Verify or update your date of birth' },
    { icon: Users2, title: 'Gender', desc: 'Select your gender' },
    { icon: MapPin, title: 'Address', desc: 'Enter your current address' },
    { icon: Users2, title: 'How Did You Hear About Us?', desc: 'Help us improve our service' },
  ];

  const Icon = steps[step - 1]?.icon;

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, [setForm, setErrors]);

  const isValid = useCallback(() => {
    if (step === 1) return form.name.trim().length >= 2;
    if (step === 2) {
      if (!form.dob) return false;
      const d = new Date(form.dob);
      return !isNaN(d.getTime()) && d <= new Date() && d.getFullYear() >= 1900;
    }
    if (step === 3) return !!form.gender;
    if (step === 4) return form.address.trim().length >= 3;
    if (step === 5) return !!form.howDidYouHear;
    return false;
  }, [step, form]);

  const validate = useCallback(() => {
    const err = {};
    if (step === 1 && form.name.trim().length < 2) err.name = 'Name must be at least 2 characters';
    if (step === 2 && !form.dob) err.dob = 'Please select your date of birth';
    if (step === 3 && !form.gender) err.gender = 'Please select your gender';
    if (step === 4 && form.address.trim().length < 3) err.address = 'Address must be at least 5 characters';
    if (step === 5 && !form.howDidYouHear) err.howDidYouHear = 'Please select an option';
    setErrors(err);
    return Object.keys(err).length === 0;
  }, [step, form, setErrors]);

  const next = useCallback(() => {
    if (validate() && step < 5) setStep(step + 1);
  }, [step, validate, setStep]);

  const back = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step, setStep]);

  const submit = useCallback(() => {
    if (validate()) {
      onSubmit();
      onClose();
    }
  }, [validate, onSubmit, onClose]);

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center px-6">

      <Dialog open={open} onOpenChange={() => { }}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center relative">
            {/* <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button> */}
            <DialogTitle>Verify Your Profile</DialogTitle>
            <DialogDescription>Please confirm or update your details</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= step ? 'bg-[#145044]' : 'bg-gray-300'}`} />
              ))}
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#145044]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {Icon && <Icon className="h-6 w-6 text-[#145044]" />}
              </div>
              <h3 className="text-xl font-bold">{steps[step - 1]?.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{steps[step - 1]?.desc}</p>
            </div>

            <div className="space-y-4">
              {step === 1 && (
                <div>
                  <Label className="mb-4" htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    autoFocus
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              )}

              {step === 2 && (
                <div>
                  <Label className="mb-4" htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                    className={errors.dob ? 'border-red-500' : ''}
                    max={new Date().toISOString().split('T')[0]}
                    autoFocus
                  />
                  {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>
              )}

              {step === 3 && (
                <div>
                  <Label className="mb-4">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => handleChange('gender', v)}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              )}

              {step === 4 && (
                <div>
                  <Label className="mb-4" htmlFor="address">Current Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your full address"
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    autoFocus
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
              )}

              {step === 5 && (
                <div>
                  <Label className="mb-4">How Did You Hear About Us?</Label>
                  <Select value={form.howDidYouHear} onValueChange={(v) => handleChange('howDidYouHear', v)}>
                    <SelectTrigger className={errors.howDidYouHear ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Friends">Friends</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.howDidYouHear && <p className="text-red-500 text-sm mt-1">{errors.howDidYouHear}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={back} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}
            <Button
              onClick={step < 5 ? next : submit}
              disabled={!isValid()}
              className="flex-1 bg-[#145044] hover:bg-[#0f3c34]"
            >
              {step < 5 ? <>Next <ChevronRight className="h-4 w-4 ml-2" /></> : 'Save & Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
});

const tierConfig = {
  ambitious: { title: 'Ambitious', color: 'bg-red-100 text-red-700', icon: TrendingUp },
  target: { title: 'Target', color: 'bg-orange-100 text-orange-700', icon: Target },
  safe: { title: 'Safe', color: 'bg-blue-100 text-blue-700', icon: Shield },
  backup: { title: 'Backup', color: 'bg-green-100 text-green-700', icon: CheckCircle }
};

const CollegeCard = ({ college }) => {
  const cfg = tierConfig[college.tier] || tierConfig.safe;
  const Icon = cfg.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 group">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {college.university}
            </h3>
            <p className="text-lg text-primary-600 font-semibold mb-2">{college.program}</p>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{college.location}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
            {cfg.title}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center">
            <Icon className="h-5 w-5 mr-2 text-gray-600" />
            <span className="font-medium text-gray-700">Admission Probability</span>
          </div>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-primary-600 mr-2">
              {college.probability}%
            </div>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${college.probability}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Clock, label: 'Duration', value: college.length || 'N/A' },
            { icon: DollarSign, label: 'Tuition', value: college.tuition ? `${college.tuition.toLocaleString()}` : 'N/A' },
            { icon: Award, label: 'Ranking', value: college.ranking?.national ? `#${college.ranking.national}` : 'N/A' },
            { icon: Users2, label: 'Acceptance Rate', value: college.acceptanceRate ? `${college.acceptanceRate}%` : 'N/A' }
          ].map((item, i) => (
            <div key={i} className="flex items-center">
              <item.icon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">{item.label}</p>
                <p className="font-medium text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
          <div className="flex flex-wrap gap-2">
            {(college.features || []).length > 0 ? college.features.map((f, idx) => (
              <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">{f}</span>
            )) : <span className="text-gray-500 text-xs">No features listed</span>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {college.description || 'No description available.'}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Eligibility Check</h4>
          <div className="space-y-2 text-sm">
            {[
              { label: 'STEM Designated', ok: college.stemDesignated },
              { label: 'F-1 Visa Eligible', ok: college.f1Eligible },
              { label: 'Accepts 3-Year Degree', ok: college.accepts3Year }
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-600">{req.label}</span>
                {req.ok ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CollegeFinderResults = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTier, setSelectedTier] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [recommendations, setRecommendations] = useState({ ambitious: [], target: [], safe: [], backup: [], total: 0 });
  const [aiInsights, setAiInsights] = useState('');
  const [error, setError] = useState(null);
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [progress, setProgress] = useState(0);

  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const [profileForm, setProfileForm] = useState({ name: '', dob: '', gender: '', address: '', howDidYouHear: '' });
  const [profileErrors, setProfileErrors] = useState({});

  const hasShownApplyPopup = useRef(false);
  const llmPromiseRef = useRef(null);
  const progressTimerRef = useRef(null);
  const user = getUser();
  const userId = isAuthenticated() ? user?._id : 'guest';
  const startProgress = useCallback(() => {
    // Clear any old timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    // Start from 0 whenever we (re)start the bar
    setProgress(0);
    const startTime = Date.now();

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Move towards 90% max while waiting
      const target = Math.min((elapsed / 90000) * 100, 90);

      setProgress((prev) => {
        // Never go beyond 90% until result comes
        if (prev >= 90) return prev;
        const next = Math.max(prev, target);
        return Math.min(next, 90);
      });
    }, 500);
  }, []);

  const loadingMessages = [
    "Analyzing your academic profile and test scores...",
    "Evaluating your work experience and leadership roles...",
    "Matching you with top programs based on your goals...",
    "Calculating admission probabilities using advanced algorithms...",
    "Identifying scholarships and financial aid opportunities...",
    "Finalizing your personalized university recommendations...",
    "Scanning global university databases for best-fit options...",
    "Assessing program alignment with your career aspirations...",
    "Reviewing application deadlines and intake cycles...",
    "Evaluating campus culture and international support...",
    "Cross-referencing with alumni success outcomes...",
    "Generating your custom admission roadmap..."
  ];

  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await getUserProfile();
      if (res.success) {
        setUserProfile(res.data);
        setProfileForm({
          name: res.data.name || '',
          dob: res.data.personalDetails?.dob ? new Date(res.data.personalDetails.dob).toISOString().split('T')[0] : '',
          gender: res.data.personalDetails?.gender || '',
          address: res.data.personalDetails?.address || '',
          howDidYouHear: res.data.howDidYouHear || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleProfileSubmit = async () => {
    try {
      const payload = {
        name: profileForm.name.trim(),
        personalDetails: {
          dob: new Date(profileForm.dob).toISOString(),
          gender: profileForm.gender,
          address: profileForm.address.trim()
        },
        howDidYouHear: profileForm.howDidYouHear
      };
      const res = await updateUserProfile(payload);
      if (res.success) {
        toast.success('Profile updated successfully!');
        await fetchUserProfile();
        setShowProfileCompletion(false);

        // LLM might already be running → start visual progress now from 0
        if (isLoading) {
          startProgress();
        }
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };



  const saveToCache = useCallback((data, insights = '') => {
    const cache = { recommendations: data, aiInsights: insights || 'Your matches are ready!', timestamp: Date.now(), userId };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(cache));
  }, [userId]);

  const loadFromCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (!raw) return false;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000 || cached.userId !== userId) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
        return false;
      }
      setRecommendations(cached.recommendations);
      setAiInsights(cached.aiInsights);
      setIsLoading(false);
      return true;
    } catch {
      return false;
    }
  }, [userId]);

  const startLlmCall = async () => {
    if (llmPromiseRef.current) return llmPromiseRef.current;

    setIsLoading(true);

    // Start / restart progress animation when LLM begins
    // if (!showProfileCompletion) {
    //   startProgress();
    // }

    llmPromiseRef.current = getAssignedUniversities()
      .then(res => {
        if (!res?.success || !res.data?.universityResults) throw new Error('Invalid response');

        const results = res.data.universityResults;
        const formatted = {
          ambitious: results.ambitious || [],
          target: results.target || [],
          safe: results.safe || [],
          backup: results.backup || [],
          total: results.total || 0
        };

        setRecommendations(formatted);
        setAiInsights('Your AI-powered university matches are ready!');
        saveToCache(formatted);

        // Stop the timer and push bar to 100% first
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
        }
        setProgress(100);

        if (isAuthenticated()) {
          fetchUserProfile();
        }

        // Small pause at 100%, then show results
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to generate recommendations. Please try again.');

        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
        }

        setIsLoading(false);
      });

    return llmPromiseRef.current;
  };


  useEffect(() => {
    const init = async () => {
      if (loadFromCache()) {
        if (isAuthenticated()) await fetchUserProfile();
        return;
      }

      if (location.state?.recommendations) {
        setRecommendations(location.state.recommendations);
        setAiInsights(location.state.aiInsights || '');
        saveToCache(location.state.recommendations, location.state.aiInsights);
        setIsLoading(false);
        if (isAuthenticated()) await fetchUserProfile();
        return;
      }

      if (isAuthenticated()) {
        await fetchUserProfile();
        setShowProfileCompletion(true);
        startLlmCall();
      } else {
        startLlmCall();
      }
    };

    init();
  }, [location.state, userId, loadFromCache, saveToCache, fetchUserProfile, isAuthenticated]);

  // Rotate messages only when loading screen is visible
  useEffect(() => {
    if (!isLoading || showProfileCompletion) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoading, showProfileCompletion]);

  // 30-second apply popup
  useEffect(() => {
    if (isLoading || error || hasShownApplyPopup.current) return;
    const timer = setTimeout(() => {
      setShowApplyPopup(true);
      hasShownApplyPopup.current = true;
    }, 30000);
    return () => clearTimeout(timer);
  }, [isLoading, error]);

  const getAllColleges = () => [
    ...(recommendations.ambitious || []),
    ...(recommendations.target || []),
    ...(recommendations.safe || []),
    ...(recommendations.backup || [])
  ];

  const getFilteredColleges = () => {
    if (selectedTier === 'all') return getAllColleges();
    return recommendations[selectedTier] || [];
  };

  const filteredColleges = getFilteredColleges();

  const exportToExcel = () => {
    const colleges = selectedTier === 'all' ? getAllColleges() : recommendations[selectedTier] || [];
    if (colleges.length === 0) return alert('No data to export');

    const rows = colleges.map(c => ({
      'University': c.university || 'N/A',
      'Program': c.program || 'N/A',
      'Tier': tierConfig[c.tier]?.title || c.tier,
      'Location': c.location || 'N/A',
      'Duration': c.length || 'N/A',
      'Admission Probability (%)': c.probability ?? 'N/A',
      'Tuition': c.tuition ? `$${c.tuition.toLocaleString()}` : 'N/A',
      'Acceptance Rate': c.acceptanceRate ? `${c.acceptanceRate}%` : 'N/A',
      'STEM': c.stemDesignated ? 'Yes' : 'No',
      'F-1 Visa': c.f1Eligible ? 'Yes' : 'No',
      'Key Features': (c.features || []).join(', ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 25 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Recommendations');
    const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `My-Universities-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navigation />

      {/* LOADING SCREEN — Only shows AFTER profile modal is closed */}
      {isLoading && !showProfileCompletion && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center px-6">
          <div className="text-center mb-10">
            <p className="text-2xl font-bold text-gray-800 mb-3">Please wait — do not refresh</p>
            <p className="text-lg text-gray-700">Your personalized matches are being prepared...</p>
            {/* <p className="text-sm text-gray-500 mt-4">Estimated time: up to 90 seconds</p> */}
          </div>

          <div className="relative mb-10">
            <Loader2 className="h-20 w-20 animate-spin text-primary-600" />
            <Brain className="absolute inset-0 m-auto h-10 w-10 text-primary-600" />
          </div>

          <div className="w-full max-w-2xl space-y-6">
            <TypewriterText text={loadingMessages[currentMessageIndex]} />

            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#145044] to-[#0f3c34] rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Generating your matches...</span>
              <span className="font-semibold text-[#145044]">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="pt-24 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <section className="sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <Trophy className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Your Personalized University Matches</h1>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {Object.entries(recommendations).map(([tier, list]) => {
                  if (tier === 'total') return null;
                  const cfg = tierConfig[tier];
                  const count = Array.isArray(list) ? list.length : 0;
                  return (
                    <div key={tier} className="bg-white rounded-xl p-5 shadow-md text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${cfg.color}`}>
                        <cfg.icon className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-600">{cfg.title}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10 md:grid-cols-4 md:items-center">
                <Button
                  onClick={() => {
                    localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
                    navigate('/university-finder');
                  }}
                  variant="outline"
                  className="w-full md:w-auto cursor-pointer hover:scale-105 transition-all flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> New Query
                </Button>

                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="w-full md:w-auto cursor-pointer hover:scale-105 transition-all flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" /> Export to Excel
                </Button>

                <Button
                  onClick={() => window.open('https://linktr.ee/goupbroad', '_blank', 'noopener,noreferrer')}
                  className="w-full md:w-auto bg-gradient-to-r from-[#145044] to-[#0f3c34] text-white font-semibold text-base rounded-md shadow-2xl cursor-pointer hover:scale-105 transition-all flex items-center justify-center"
                >
                  <Sparkles className="h-4 w-4 mr-2 hidden md:block" />
                  Book a Consultation
                </Button>

                <div className="w-full md:w-auto bg-gradient-to-r from-[#145044] to-[#0f3c34] border-2 border-[#145044] rounded-md px-5 py-0 shadow-md flex items-center justify-between md:justify-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-white hidden md:block" />
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-white">
                        {userProfile?.universityFinderLlmResponseLimit != null
                          ? Math.max(0, userProfile.universityFinderLlmResponseLimit)
                          : user?.universityFinderLlmResponseLimit != null
                            ? Math.max(0, user.universityFinderLlmResponseLimit)
                            : 0}
                      </p>
                      <p className="text-base font-medium text-white">
                        {(userProfile?.universityFinderLlmResponseLimit ?? user?.universityFinderLlmResponseLimit ?? 0) === 1 ? 'Credit' : 'Credits'} Left
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-10 overflow-x-auto md:overflow-visible">
                <div className="flex flex-nowrap md:flex-wrap gap-2 w-max md:w-auto justify-end">
                  {['all', 'ambitious', 'target', 'safe', 'backup'].map((tier) => {
                    const isActive = selectedTier === tier;
                    const cfg = tier === 'all' ? { title: 'All' } : tierConfig[tier];

                    return (
                      <Button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        variant={isActive ? 'default' : 'outline'}
                        className={`flex items-center gap-2 ${isActive ? 'bg-gradient-to-r from-[#145044] to-[#0f3c34] text-white' : ''}`}
                        size="sm"
                      >
                        {cfg.icon && <cfg.icon className="h-4 w-4" />}
                        {cfg.title}
                        {tier !== 'all' && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full ml-2">
                            {recommendations[tier]?.length || 0}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {filteredColleges.map(college => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-1/2 mx-auto flex cursor-pointer mt-6 bg-gradient-to-r from-[#145044] to-[#0f3c34] hover:from-[#0f3c34] hover:to-[#0b3029] text-white font-bold text-xl py-6 sm:py-8 rounded-2xl shadow-xl"
              onClick={() => window.open('https://linktr.ee/goupbroad', '_blank', 'noopener,noreferrer')}

            >
              <Sparkles className="h-7 w-7 mr-3" />
              Book a Consultation
            </Button>
          </section>

          {/* 30-second Apply Popup */}
          {showApplyPopup && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowApplyPopup(false)}>
              <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 text-center animate-in fade-in zoom-in relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowApplyPopup(false)}
                  className="absolute top-6 right-6 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <Sparkles className="h-20 w-20 text-[#145044] mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Future Starts Today!
                </h3>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  You’ve got incredible university matches. Don’t wait — turn your profile into acceptances!
                </p>
                <Button
                  size="lg"
                  className="w-full cursor-pointer bg-gradient-to-r from-[#145044] to-[#0f3c34] hover:from-[#0f3c34] hover:to-[#0b3029] text-white font-bold text-xl py-8 rounded-2xl shadow-xl"
                  onClick={() => {
                    setShowApplyPopup(false);
                    window.open('https://linktr.ee/goupbroad', '_blank', 'noopener,noreferrer');
                  }}

                >
                  <Sparkles className="h-7 w-7 mr-3" />
                  Book a Consultation
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Profile Completion Modal */}
      {isAuthenticated() && showProfileCompletion && (
        <ProfileCompletionModal
          open={showProfileCompletion}
          onClose={() => setShowProfileCompletion(false)}
          form={profileForm}
          setForm={setProfileForm}
          step={profileStep}
          setStep={setProfileStep}
          errors={profileErrors}
          setErrors={setProfileErrors}
          onSubmit={handleProfileSubmit}
        />
      )}

      <Footer />
    </div>
  );
};

export default CollegeFinderResults;