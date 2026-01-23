import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Search, Filter, Plus, MapPin, GraduationCap, Building, Globe, ChevronRight, ChevronLeft, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { getUser } from '@/lib/auth';
import { getUniversities, createUniversity, updateUniversity, deleteUniversity } from '@/services/universityService';
import { uploadFile } from '@/services/uploadService';

const Universities = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);

  const hasEditPermission = () => {
    const currentUser = getUser();
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
  };

  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditUniversityOpen, setIsEditUniversityOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    program: '',
    min_acceptance_rate: null,
    max_acceptance_rate: null,
  });

  const [isAddUniversityOpen, setIsAddUniversityOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newUniversity, setNewUniversity] = useState({
    name: '',
    location: '',
    website: '',
    description: '',
    category: 'high-chance',
    ranking: '',
    acceptance_rate: '',
    tuition: '',
    application_fee: '',
    deadline: '',
    programs: ''
  });

  const [newProgram, setNewProgram] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  console.log(universities)
  const categoryOptions = [
    { label: 'Top Tier', value: 'top-tier' },
    { label: 'High Chance', value: 'high-chance' },
    { label: 'Moderate Chance', value: 'moderate-chance' },
    { label: 'Safety', value: 'safety' }
  ];

  const categoryBadge = (category) => {
    switch (category) {
      case 'top-tier':
        return <Badge className="bg-purple-500">Top Tier</Badge>;
      case 'high-chance':
        return <Badge className="bg-blue-500">High Chance</Badge>;
      case 'moderate-chance':
        return <Badge className="bg-amber-500">Moderate Chance</Badge>;
      case 'safety':
        return <Badge className="bg-green-500">Safety</Badge>;
      default:
        return null;
    }
  };
  const fetchUniversities = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 12
      };


      if (searchTerm?.trim()) {
        params.search = searchTerm.trim();
      }


      if (activeTab !== 'all') {
        params.category = activeTab;
      }


      if (filters.name?.trim()) {
        params.name = filters.name.trim();
      }

      if (filters.program?.trim()) {
        params.program = filters.program.trim();
      }


      if (!isNaN(parseFloat(filters.min_acceptance_rate))) {
        params.min_acceptance_rate = parseFloat(filters.min_acceptance_rate);
      }

      if (!isNaN(parseFloat(filters.max_acceptance_rate))) {
        params.max_acceptance_rate = parseFloat(filters.max_acceptance_rate);
      }

      const response = await getUniversities(params);
      console.log(response);
      setUniversities(response.data.universities || []);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching universities:', error);
      toast.error('Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, searchTerm, filters]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const handleAddUniversity = async () => {
    // Check if user has permission to add universities
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to add universities');
      return;
    }

    if (currentStep === 1 && (!newUniversity.name || !newUniversity.location)) {
      toast.error('University name and location are required');
      return;
    }

    if (currentStep === 2 && !newUniversity.programs.length) {
      toast.error('Program Cant be empty');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setLoading(true);
        const universityData = {
          name: newUniversity.name,
          location: newUniversity.location || null,
          logo: newUniversity.logo || null,
          banner: newUniversity.banner,
          program: newUniversity.programs || '',
          description: newUniversity.description || null,
          website_url: newUniversity.website_url || null,
          university_type: newUniversity.university_type || 'Private',
          address: newUniversity.address || null,
          university_category: newUniversity.category || null,
          ranking: {
            international: !isNaN(parseInt(newUniversity.ranking.international)) ?
              parseInt(newUniversity.ranking.international) : null,
            national: !isNaN(parseInt(newUniversity.ranking.national)) ?
              parseInt(newUniversity.ranking.national) : null
          },
          acceptance_rate: !isNaN(parseFloat(newUniversity.acceptance_rate)) ?
            Math.min(Math.max(parseFloat(newUniversity.acceptance_rate), 0), 100) : null,
          living_cost_per_year: 20000,
          tuition_fees_per_year: !isNaN(parseFloat(newUniversity.tuition?.replace(/[^0-9.]/g, ''))) ?
            Math.max(parseFloat(newUniversity.tuition.replace(/[^0-9.]/g, '')), 0) : null,
          application_fee: !isNaN(parseFloat(newUniversity.application_fee?.replace(/[^0-9.]/g, ''))) ?
            Math.max(parseFloat(newUniversity.application_fee.replace(/[^0-9.]/g, '')), 0) : null,
          application_deadline: newUniversity.deadline ? new Date(newUniversity.deadline) : null
        };

        await createUniversity(universityData);
        resetForm();
        setIsAddUniversityOpen(false);
        toast.success('University added successfully!');
        fetchUniversities();
      } catch (error) {
        console.error('Error adding university:', error);
        toast.error(error?.response?.data?.message || 'Failed to add university');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddProgram = () => {
    if (newProgram.trim() && !newUniversity.programs.includes(newProgram)) {
      setNewUniversity({
        ...newUniversity,
        programs: [...newUniversity.programs, newProgram]
      });
      setNewProgram('');
    }
  };

  const handleRemoveProgram = (program) => {
    setNewUniversity({
      ...newUniversity,
      programs: newUniversity.programs.filter(p => p !== program)
    });
  };

  const resetForm = () => {
    setNewUniversity({
      name: '',
      location: '',
      website: '',
      website_url: '',
      university_type: 'Private',
      address: '',
      banner: null,
      description: '',
      category: 'high-chance',
      ranking: {
        international: '',
        national: ''
      },
      acceptance_rate: '',
      tuition: '',
      application_fee: '',
      deadline: '',
      programs: []
    });
    setNewProgram('');
    setCurrentStep(1);
  };

  const handleDeleteUniversity = async () => {
    // Check if user has permission to delete universities
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to delete universities');
      return;
    }

    try {
      setLoading(true);
      await deleteUniversity(selectedUniversity._id);
      toast.success('University deleted successfully');
      setIsDeleteConfirmOpen(false);
      setIsViewDetailsOpen(false);
      setSelectedUniversity(null);
      fetchUniversities();
    } catch (error) {
      console.error('Error deleting university:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete university');
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (field, value) => {
    setNewUniversity({
      ...newUniversity,
      [field]: value
    });
  };

  const handleFilter = () => {
    setCurrentPage(1);
    setIsFilterOpen(false);
    fetchUniversities();
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      program: '',
      min_acceptance_rate: null,
      max_acceptance_rate: null,
    });
  };
  const handleUpdateUniversity = async () => {
    // Check if user has permission to update universities
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to update universities');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: selectedUniversity.name,
        location: selectedUniversity.location,
        address: selectedUniversity.address,
        description: selectedUniversity.description,
        website_url: selectedUniversity.website_url,
        university_type: selectedUniversity.university_type,
        university_category: selectedUniversity.university_category,
        logo: selectedUniversity.logo,
        banner: selectedUniversity.banner,
        program: selectedUniversity.program,
        ranking: selectedUniversity.ranking,
        acceptance_rate: selectedUniversity.acceptance_rate,
        tuition_fees_per_year: selectedUniversity.tuition_fees_per_year,
        application_fee: selectedUniversity.application_fee,
        application_deadline: selectedUniversity.application_deadline,
      };

      await updateUniversity(selectedUniversity._id, updateData);
      toast.success('University updated successfully');
      setIsEditUniversityOpen(false);
      setSelectedUniversity(null);
      fetchUniversities();
    } catch (error) {
      console.error('Error updating university:', error);
      toast.error(error?.response?.data?.message || 'Failed to update university');
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (field, value) => {
    if (field === 'min_acceptance_rate' || field === 'max_acceptance_rate') {
      // Handle empty values
      if (value === '') {
        setFilters(prev => ({ ...prev, [field]: null }));
        return;
      }

      // Parse and validate numeric value
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        return; // Invalid input, don't update
      }

      setFilters(prev => {
        const newFilters = { ...prev, [field]: numValue };

        if (field === 'min_acceptance_rate' &&
          newFilters.max_acceptance_rate !== null &&
          numValue > newFilters.max_acceptance_rate) {
          return prev;
        }
        if (field === 'max_acceptance_rate' &&
          newFilters.min_acceptance_rate !== null &&
          numValue < newFilters.min_acceptance_rate) {
          return prev;
        }

        return newFilters;
      });
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };
  const handleLogoUpload = async (event) => {
    // Check if user has permission to upload files
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to upload files');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'university');
      const response = await uploadFile(formData);

      if (selectedUniversity) {
        setSelectedUniversity({
          ...selectedUniversity,
          logo: response.data.url
        });
      } else {
        setNewUniversity({
          ...newUniversity,
          logo: response.data.url
        });
      }
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };
  const handleBannerUpload = async (event) => {
    // Check if user has permission to upload files
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to upload files');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'university');

      const response = await uploadFile(formData);

      if (selectedUniversity) {
        setSelectedUniversity({
          ...selectedUniversity,
          banner: response.data.url
        });
      } else {
        setNewUniversity({
          ...newUniversity,
          banner: response.data.url
        });
      }

      toast.success('Banner uploaded successfully');
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload banner');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditNext = () => {
    if (currentStep === 1 && (!selectedUniversity.name || !selectedUniversity.location)) {
      toast.error('University name and location are required');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleUpdateUniversity();
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">University Management</h1>
          {hasEditPermission() && (
            <Button onClick={() => setIsAddUniversityOpen(true)} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> Add University
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search universities..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Input
            placeholder="Program"
            className="w-40"
            value={filters.program}
            onChange={(e) => handleFilterChange('program', e.target.value)}
          />
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          {/* <TabsList>
            <TabsTrigger value="all">All Universities</TabsTrigger>
            <TabsTrigger value="top-tier">Top Tier</TabsTrigger>
            <TabsTrigger value="high-chance">High Chance</TabsTrigger>
            <TabsTrigger value="others">Others</TabsTrigger>
          </TabsList> */}
          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {universities.map((university) => (
                    <Card key={university._id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-2">
                            {university.logo ? (
                              <img src={university.logo} alt={university.name} className="w-full h-full object-cover" />
                            ) : (
                              <AvatarFallback>{university.name ? university.name.charAt(0) : 'U'}</AvatarFallback>
                            )}
                          </Avatar>
                          <CardTitle className="text-md font-medium">{university.name}</CardTitle>
                        </div>
                        {categoryBadge(university.category)}
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm mt-2 space-y-3">
                          <div className="flex items-start">
                            <MapPin className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span>{university.location}</span>
                          </div>
                          <div className="flex items-start">
                            <GraduationCap className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span>{university.program}</span>
                          </div>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Acceptance Rate: {university.acceptance_rate}%</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                             style={{ cursor: 'pointer' }}
                            onClick={() => university.website_url ? window.open(university.website_url, '_blank') : null}
                            disabled={!university.website_url}
                          >
                            <Globe className="mr-1 h-3.5 w-3.5" />
                            Website
                          </Button>
                          <Button
                            style={{ cursor: 'pointer' }}
                            size="sm"
                            onClick={() => {
                              setSelectedUniversity(university);
                              setIsViewDetailsOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {universities.length === 0 && !loading && (
                  <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">No universities found</p>
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="top-tier">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Filtered top-tier universities will be shown here based on the activeTab state */}
            </div>
          </TabsContent>
          <TabsContent value="high-chance">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Filtered high-chance universities */}
            </div>
          </TabsContent>
          <TabsContent value="others">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Filtered other universities */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[70vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle>University Details</DialogTitle>
          </DialogHeader>
          {selectedUniversity && (
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedUniversity.banner && (
                <div className="relative h-48 w-[calc(100%+2rem)] -ml-6 -mr-6 mb-4 -mt-4">
                  <img
                    src={selectedUniversity.banner}
                    alt={`${selectedUniversity.name} banner`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
                </div>
              )}
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4 pb-2">
                  <Avatar className="h-16 w-16 border">
                    {selectedUniversity.logo ? (
                      <img src={selectedUniversity.logo} alt={selectedUniversity.name} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="text-xl">{selectedUniversity.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUniversity.name}</h2>
                    <p className="text-muted-foreground">{selectedUniversity.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4"><div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-sm mt-1">{selectedUniversity.description}</p>
                </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-sm mt-1">{selectedUniversity.location}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Address</h3>
                      <p className="text-sm mt-1">{selectedUniversity.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">University Type</h3>
                      <p className="text-sm mt-1">{selectedUniversity.university_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Website</h3>
                      <a href={selectedUniversity.website_url} target="_blank" rel="noopener noreferrer" className="text-sm mt-1 text-blue-600 hover:underline">
                        {selectedUniversity.website_url || 'Not available'}
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Acceptance Rate</h3>
                      <p className="text-sm mt-1">{selectedUniversity.acceptance_rate}%</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">International Ranking</h3>
                      <p className="text-sm mt-1">#{selectedUniversity.ranking?.international || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Tuition Fee (per year)</h3>
                      <p className="text-sm mt-1">${selectedUniversity.tuition_fees_per_year?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Application Fee</h3>
                      <p className="text-sm mt-1">${selectedUniversity.application_fee?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <h3 className="font-semibold">Application Deadline</h3>
                      <p className="text-sm mt-1">
                        {selectedUniversity.application_deadline
                          ? new Date(selectedUniversity.application_deadline).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Program</h3>
                      <p className="text-sm mt-1">{selectedUniversity.program?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 mt-4">
                  {hasEditPermission() && (
                    <div className="mr-auto">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setIsViewDetailsOpen(false);
                          setIsDeleteConfirmOpen(true);
                        }}
                      >
                        Delete University
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDetailsOpen(false);
                      setSelectedUniversity(null);
                    }}
                  >
                    Close
                  </Button>
                  {hasEditPermission() && (
                    <Button
                      onClick={() => {
                        setIsViewDetailsOpen(false);
                        setSelectedUniversity(selectedUniversity);
                        setIsEditUniversityOpen(true);
                      }}
                    >
                      Edit University
                    </Button>
                  )}
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isEditUniversityOpen} onOpenChange={(open) => {
        if (!open) {
          setCurrentStep(1);
          setSelectedUniversity(null);
        }
        setIsEditUniversityOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <div className="flex flex-col h-full">
            <DialogHeader className="border-b pb-4">
              <DialogTitle>Edit University</DialogTitle>
              <DialogDescription>
                {currentStep === 1 && 'Basic university information and media.'}
                {currentStep === 2 && 'Programs and category information.'}
                {currentStep === 3 && 'Rankings, fees, and additional details.'}
              </DialogDescription>
            </DialogHeader>

            {selectedUniversity && (
              <>
                <div className="flex-1 overflow-y-auto">
                  {currentStep === 1 && (
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-name">University Name</Label>
                        <Input
                          id="edit-name"
                          value={selectedUniversity.name}
                          disabled={!hasEditPermission()}
                          onChange={(e) => setSelectedUniversity(prev => ({
                            ...prev,
                            name: e.target.value
                          }))} />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-location">Location</Label>
                        <Input
                          id="edit-location"
                          value={selectedUniversity.location}
                          disabled={!hasEditPermission()}
                          onChange={(e) => setSelectedUniversity(prev => ({
                            ...prev,
                            location: e.target.value
                          }))} />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-address">Address</Label>
                        <Input
                          id="edit-address"
                          value={selectedUniversity.address}
                          disabled={!hasEditPermission()}
                          onChange={(e) => setSelectedUniversity(prev => ({
                            ...prev,
                            address: e.target.value
                          }))} />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-website">Website URL</Label>
                        <Input
                          id="edit-website"
                          type="url"
                          value={selectedUniversity.website_url}
                          disabled={!hasEditPermission()}
                          onChange={(e) => setSelectedUniversity(prev => ({
                            ...prev,
                            website_url: e.target.value
                          }))} />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-logo">Logo</Label>
                        <div className="flex items-center gap-4">
                          {selectedUniversity.logo && (
                            <img
                              src={selectedUniversity.logo}
                              alt="University logo"
                              className="h-16 w-16 object-contain" />
                          )}
                          {hasEditPermission() ? (
                            <div className="flex-1 relative">
                              <Input
                                id="edit-logo"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleLogoUpload}
                                disabled={isUploading}
                                className={isUploading ? 'opacity-50' : ''} />
                              {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Viewing mode: Upload disabled</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Upload a logo image (JPEG, PNG, GIF, WebP; max 5MB)</p>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-banner">Banner</Label>
                        <div className="space-y-4">
                          {selectedUniversity.banner && (
                            <div className="relative h-32 w-full rounded-md overflow-hidden">
                              <img
                                src={selectedUniversity.banner}
                                alt="University banner"
                                className="w-full h-full object-cover" />
                            </div>
                          )}
                          {hasEditPermission() ? (
                            <div className="relative">
                              <Input
                                id="edit-banner"
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleBannerUpload}
                                disabled={isUploading}
                                className={isUploading ? 'opacity-50' : ''} />
                              {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Viewing mode: Upload disabled</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Upload a banner image (JPEG, PNG, GIF, WebP; max 5MB)</p>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-type">University Type</Label>
                        <Select
                          value={selectedUniversity.university_type || ''}
                          onValueChange={(value) => setSelectedUniversity(prev => ({
                            ...prev,
                            university_type: value
                          }))}
                          disabled={!hasEditPermission()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Public">Public</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                            <SelectItem value="Public-Private">Public-Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={selectedUniversity.description}
                          disabled={!hasEditPermission()}
                          onChange={(e) => setSelectedUniversity(prev => ({
                            ...prev,
                            description: e.target.value
                          }))} />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="edit-category">University Category</Label>
                        <Select
                          value={selectedUniversity.university_category || 'high-chance'}
                          onValueChange={(value) => setSelectedUniversity(prev => ({
                            ...prev,
                            university_category: value
                          }))}
                          disabled={!hasEditPermission()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-national-rank">National Ranking</Label>
                          <Input
                            id="edit-national-rank"
                            type="number"
                            min="1"
                            value={selectedUniversity.ranking?.national || ''}
                            disabled={!hasEditPermission()}
                            onChange={(e) => setSelectedUniversity(prev => ({
                              ...prev,
                              ranking: {
                                ...prev.ranking,
                                national: e.target.value ? Number(e.target.value) : null
                              }
                            }))} />
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-intl-rank">International Ranking</Label>
                          <Input
                            id="edit-intl-rank"
                            type="number"
                            min="1"
                            value={selectedUniversity.ranking?.international || ''}
                            disabled={!hasEditPermission()}
                            onChange={(e) => setSelectedUniversity(prev => ({
                              ...prev,
                              ranking: {
                                ...prev.ranking,
                                international: e.target.value ? Number(e.target.value) : null
                              }
                            }))} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-acceptance-rate">Acceptance Rate (%)</Label>
                          <Input
                            id="edit-acceptance-rate"
                            type="number"
                            min="0"
                            max="100"
                            value={selectedUniversity.acceptance_rate || ''}
                            disabled={!hasEditPermission()}
                            onChange={(e) => setSelectedUniversity(prev => ({
                              ...prev,
                              acceptance_rate: Math.min(100, Math.max(0, Number(e.target.value) || 0))
                            }))} />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-tuition">Tuition Fee (per year)</Label>
                          <Input
                            id="edit-tuition"
                            type="number"
                            min="0"
                            value={selectedUniversity.tuition_fees_per_year || ''}
                            disabled={!hasEditPermission()}
                            onChange={(e) => setSelectedUniversity(prev => ({
                              ...prev,
                              tuition_fees_per_year: Math.max(0, Number(e.target.value) || 0)
                            }))} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-application-fee">Application Fee</Label>
                          <Input
                            id="edit-application-fee"
                            type="number"
                            min="0"
                            value={selectedUniversity.application_fee || ''}
                            disabled={!hasEditPermission()}
                            onChange={(e) => setSelectedUniversity(prev => ({
                              ...prev,
                              application_fee: Math.max(0, Number(e.target.value) || 0)
                            }))} />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="edit-deadline">Application Deadline</Label>
                          <Input
                            id="edit-deadline"
                            type="date"
                            value={selectedUniversity.application_deadline ? new Date(selectedUniversity.application_deadline).toISOString().split('T')[0] : ''}
                            disabled={!hasEditPermission()}
                            onChange={(e) => setSelectedUniversity(prev => ({
                              ...prev,
                              application_deadline: e.target.value
                            }))} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <DialogFooter className="flex items-center justify-between px-2">
                    <div>
                      {currentStep > 1 && (
                        <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditUniversityOpen(false);
                          setSelectedUniversity(null);
                          setCurrentStep(1);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditNext}
                        disabled={isUploading}
                      >
                        {currentStep < 3 ? (
                          <>
                            {isUploading ? 'Uploading...' : 'Next'}
                            {!isUploading && <ChevronRight className="ml-2 h-4 w-4" />}
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUniversityOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsAddUniversityOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New University</DialogTitle>
            <DialogDescription>
              {currentStep === 1 && 'Enter university information.'}
              {currentStep === 2 && 'Add programs offered by this university.'}
              {currentStep === 3 && 'Add additional details for student reference.'}
            </DialogDescription>
          </DialogHeader>

          {currentStep === 1 && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">University Name *</Label>
                  <Input
                    id="name"
                    value={newUniversity.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter university name"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={newUniversity.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State, Country"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newUniversity.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full university address"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={newUniversity.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://www.university.edu"
                  />
                </div>

                <div className="grid gap-1.5">                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-4">
                    {newUniversity.logo && (
                      <img
                        src={newUniversity.logo}
                        alt="University logo"
                        className="h-16 w-16 object-contain"
                      />
                    )}
                    <div className="flex-1 relative">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                        className={isUploading ? 'opacity-50' : ''}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload a logo image (JPEG, PNG, GIF, WebP; max 5MB)</p>
                </div>

                <div className="grid gap-1.5">                  <Label htmlFor="banner">Banner</Label>
                  <div className="space-y-4">
                    {newUniversity.banner && (
                      <div className="relative h-32 w-full rounded-md overflow-hidden">
                        <img
                          src={newUniversity.banner}
                          alt="University banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Input
                        id="banner"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleBannerUpload}
                        disabled={isUploading}
                        className={isUploading ? 'opacity-50' : ''}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Upload a banner image (JPEG, PNG, GIF, WebP; max 5MB)</p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="university_type">University Type</Label>
                  <Select
                    value={newUniversity.university_type}
                    onValueChange={(value) => handleInputChange('university_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Public-Private">Public-Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newUniversity.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the university"
                    className="h-20"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label>Programs Offered *</Label>
                <div className="flex gap-2">
                  <Input
                    value={newUniversity.programs}
                    onChange={(e) => setNewUniversity({ ...newUniversity, programs: e.target.value })}
                    placeholder="Enter program name"
                    className="flex-1"
                  />
                  {/* <Button
                    type="button"
                    onClick={handleAddProgram}
                  >
                    Add
                  </Button> */}
                </div>

                {/* {newUniversity.programs.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Added Programs:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {newUniversity.programs.map((program, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                          {program}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                            onClick={() => handleRemoveProgram(program)}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No programs added yet. Add at least one program.</p>
                )} */}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="category">University Category</Label>
                <Select
                  value={newUniversity.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">This helps categorize universities for student recommendations.</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="ranking-international">International Ranking</Label>
                  <Input
                    id="ranking-international"
                    type="number"
                    min="1"
                    value={newUniversity.ranking?.international || ''}
                    onChange={(e) => handleInputChange('ranking', {
                      ...newUniversity.ranking,
                      international: e.target.value ? parseInt(e.target.value, 10) : null
                    })}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="e.g., 15"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ranking-national">National Ranking</Label>
                  <Input
                    id="ranking-national"
                    type="number"
                    min="1"
                    value={newUniversity.ranking?.national || ''}
                    onChange={(e) => handleInputChange('ranking', {
                      ...newUniversity.ranking,
                      national: e.target.value ? parseInt(e.target.value, 10) : null
                    })}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="e.g., 15"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="acceptance_rate">Acceptance Rate</Label>
                  <Input
                    id="acceptance_rate"
                    value={newUniversity.acceptance_rate}
                    onChange={(e) => handleInputChange('acceptance_rate', e.target.value)}
                    placeholder="e.g., 12.5%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="tuition">Tuition Fee</Label>
                  <Input
                    id="tuition"
                    value={newUniversity.tuition}
                    onChange={(e) => handleInputChange('tuition', e.target.value)}
                    placeholder="e.g., $50,000"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="application_fee">Application Fee</Label>
                  <Input
                    id="application_fee"
                    value={newUniversity.application_fee}
                    onChange={(e) => handleInputChange('application_fee', e.target.value)}
                    placeholder="e.g., $75"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newUniversity.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between w-full">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
            <div>
              <Button variant="outline" onClick={() => setIsAddUniversityOpen(false)} className="mr-2">
                Cancel
              </Button>              <Button
                onClick={handleAddUniversity}
                disabled={isUploading}
              >
                {currentStep < 3 ? (
                  <>
                    {isUploading ? 'Uploading...' : 'Next'}
                    {!isUploading && <ChevronRight className="ml-2 h-4 w-4" />}
                  </>
                ) : (
                  'Add University'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Universities</DialogTitle>
            <DialogDescription>
              Set filters to refine university search results
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="min-rate">Minimum Acceptance Rate (%)</Label>
                <Input
                  id="min-rate"
                  type="number"
                  min={0}
                  max={100}
                  value={filters.min_acceptance_rate || ''}
                  onChange={(e) => handleFilterChange('min_acceptance_rate', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="max-rate">Maximum Acceptance Rate (%)</Label>
                <Input
                  id="max-rate"
                  type="number"
                  min={0}
                  max={100}
                  value={filters.max_acceptance_rate || ''}
                  onChange={(e) => handleFilterChange('max_acceptance_rate', e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
            <Button onClick={handleFilter}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete University</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this university? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUniversity}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Universities;