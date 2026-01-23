import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, FilterIcon, FlashlightIcon } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import SidebarHeader from '@/components/SidebarHeader';
import { apiService } from '../../services/api.services';
import { toast } from 'sonner';

const UniversityManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [universityData, setUniversityData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [filters, setFilters] = useState({
    admissionStatus: '',
    universityStatus: '',
    searchQuery: ''
  });

  const fetchUniversityDetails = async (id) => {
    try {
      setLoading(true);
      const response = await apiService.get(`/universities/${id}`);
      if (response.data) {
        setUniversityData({
          ...response.data,
          status: assignments.find(a => a.universityId._id === id)?.admissionStatus || 'Applied'
        });
      }
    } catch (error) {
      console.error('Error fetching university details:', error);
      toast.error('Failed to fetch university details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortOrder: 'asc',
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.admissionStatus) params.append('admissionStatus', filters.admissionStatus);
      if (filters.universityStatus) params.append('universityStatus', filters.universityStatus);
      if (filters.searchQuery) params.append('search', filters.searchQuery);

      const response = await apiService.get(`/student/assigned-universities?${params}`);
      
      if (response.data) {
        setAssignments(response.data.assignments);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          hasNextPage: response.data.pagination.hasNextPage,
          hasPrevPage: response.data.pagination.hasPrevPage
        }));
        
        // Load the first university details by default if we have results and no university is selected
        if (response.data.assignments.length > 0 && !universityData) {
          fetchUniversityDetails(response.data.assignments[0].universityId._id);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch universities');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, universityData]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filter changes
    fetchAssignments(); // Immediately fetch new results
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleStatusChange = async (assignmentId, admissionStatus, universityStatus) => {
    try {
      setLoading(true);
      const assignment = assignments.find(a => a._id === assignmentId);
      const updatedData = {
        admissionStatus: admissionStatus || assignment.admissionStatus,
        universityStatus: universityStatus || assignment.universityStatus
      };
      
      await apiService.put(`/student/assigned-universities/${assignmentId}`, updatedData);
      await fetchAssignments();
      
      // Refresh the university details if this is the currently selected university
      if (universityData?._id === assignment.universityId._id) {
        fetchUniversityDetails(assignment.universityId._id);
      }
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };
  
  // Always show pagination even if no results on current page
  const showPagination = () => {
    return (
      <div className="flex justify-between items-center mt-4 px-2">
        <button 
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          disabled={!pagination.hasPrevPage}
          className="text-sm text-gray-600 hover:text-primary disabled:text-gray-400 disabled:hover:text-gray-400"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          disabled={!pagination.hasNextPage}
          className="text-sm text-gray-600 hover:text-primary disabled:text-gray-400 disabled:hover:text-gray-400"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar isSidebarOpen={!isSidebarOpen} />
        
        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/3">
                <div className="mb-6 bg-white rounded-md">
                  <div 
                    className="relative flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <div className="flex items-center gap-3 text-primary">
                      <FilterIcon fill='#002b56'/>
                      <span className="font-medium">Got Admit</span>
                    </div>
                    <div className="ml-auto">
                      <ChevronDown className={`h-5 w-5 text-black transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {isFilterOpen && (
                    <div className="p-4 space-y-3 border-t border-gray-100">
                      <div className="relative">
                        <select
                          className="appearance-none w-full rounded-md text-sm border border-gray-300 px-3 py-2"
                          value={filters.admissionStatus}
                          onChange={(e) => {
                            handleFilterChange('admissionStatus', e.target.value);
                            setIsFilterOpen(false);
                          }}
                        >
                          <option value="">All Admission Status</option>
                          <option value="Got Admit">Got Admit</option>
                          <option value="Applied">Applied</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pending">Pending</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>

                      <div className="relative">
                        <select
                          className="appearance-none w-full rounded-md text-sm border border-gray-300 px-3 py-2"
                          value={filters.universityStatus}
                          onChange={(e) => {
                            handleFilterChange('universityStatus', e.target.value);
                            setIsFilterOpen(false);
                          }}
                        >
                          <option value="">All University Status</option>
                          <option value="Ambitious">Ambitious</option>
                          <option value="Achievable">Achievable</option>
                          <option value="Safe">Safe</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  )}
                  <hr className='border-1 border-primary' />
                </div>

                {loading && assignments.length === 0 ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No universities found
                  </div>
                ) : (
                  <>
                    {assignments.map((assignment) => (
                      <div 
                        key={assignment._id}
                        onClick={() => fetchUniversityDetails(assignment.universityId._id)}
                        className={`mb-4 rounded-md overflow-hidden cursor-pointer ${
                          universityData?._id === assignment.universityId._id ? 'bg-primary text-white' : 'bg-white'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex flex-row justify-between">
                            <div className="flex flex-col">
                              <h3 className={`font-semibold text-base ${
                                universityData?._id === assignment.universityId._id ? 'text-white' : 'text-gray-800'
                              }`}>
                                {assignment.universityId.name}
                              </h3>
                              <div className={`text-sm ${
                                universityData?._id === assignment.universityId._id ? 'text-gray-100' : 'text-gray-500'
                              } mb-1`}>
                                {assignment.universityId.location}
                              </div>
                              <div className={`text-sm ${
                                universityData?._id === assignment.universityId._id ? 'text-gray-100' : 'text-gray-600'
                              }`}>
                                {assignment.universityId.program}
                              </div>
                              
                              <div className="mt-3">
                                <span className={`text-xs px-2 py-1 rounded-sm ${
                                  universityData?._id === assignment.universityId._id 
                                    ? 'bg-white text-primary' 
                                    : 'bg-primary text-white'
                                }`}>
                                  {assignment.universityStatus}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 justify-center">
                              <div className="relative">
                                <select 
                                  className={`appearance-none w-full rounded-md text-xs border ${
                                    assignment.admissionStatus === 'Got Admit'
                                    ? 'bg-teal-50 border-teal-300 text-teal-900'
                                    : assignment.admissionStatus === 'Applied'
                                    ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                                    : 'bg-white border-gray-300 text-gray-900'
                                  } px-3 mr-3 py-1.5`}
                                  value={assignment.admissionStatus}
                                  onChange={(e) => handleStatusChange(assignment._id, e.target.value)}
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Got Admit">Got Admit</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>
                                  <option value="Pending">Pending</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                </div>
                              </div>
                              
                              <div className="relative">
                                <select 
                                  className={`appearance-none w-full rounded-md text-xs border ${
                                    assignment.universityStatus === 'Safe'
                                    ? 'bg-teal-50 border-teal-300 text-teal-900'
                                    : assignment.universityStatus === 'Achievable'
                                    ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
                                    : 'bg-white border-gray-300 text-gray-900'
                                  } px-3 mr-3 py-1.5`}
                                  value={assignment.universityStatus}
                                  onChange={(e) => handleStatusChange(assignment._id, assignment.admissionStatus, e.target.value)}
                                >
                                  <option value="Ambitious">Ambitious</option>
                                  <option value="Achievable">Achievable</option>
                                  <option value="Safe">Safe</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {assignments.length > 0 && showPagination()}
                  </>
                )}
              </div>

              <div className="flex-1 bg-white rounded-lg shadow-sm">
                {!universityData ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Select a university to view details</div>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800">{universityData.name}</h2>
                      <div className="w-10 h-10 bg-purple-700 flex items-center justify-center rounded text-white text-xl font-bold">
                        <FlashlightIcon/>
                      </div>
                    </div>

                    <div className="w-full h-64 relative overflow-hidden p-3">
                      <img
                        src={universityData.banner || 'https://cdn.pixabay.com/photo/2016/11/14/05/15/academic-1822682_960_720.jpg'}
                        alt={universityData.name}
                        className="w-full h-full rounded-lg"
                      />
                    </div>

                    <div className="p-5">
                      <div className="mb-6">
                        <h3 className="text-gray-700 font-medium mb-2">Description</h3>
                        <div className="text-sm text-gray-600 whitespace-pre-line">
                          {universityData.description}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-gray-700 font-medium mb-2">University Address</h3>
                        <p className="text-sm text-gray-600">{universityData.address}</p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-gray-700 font-medium mb-2">Rankings</h3>
                        <div className="flex">
                          <div className="w-1/2 bg-teal-800 text-white p-3 flex flex-col items-center">
                            <span className="text-2xl font-bold">{universityData.ranking?.international || 'N/A'}</span>
                            <span className="text-xs">International Rank</span>
                          </div>
                          <div className="w-1/2 bg-yellow-500 text-white p-3 flex flex-col items-center">
                            <span className="text-2xl font-bold">{universityData.ranking?.national || 'N/A'}</span>
                            <span className="text-xs">National Rank</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-gray-700 font-medium mb-2">International Graduate Admission Address and Contact Details</h3>
                        <div className="text-sm text-gray-600">
                          <p>{universityData.address}</p>
                          <p className="mt-2">
                            <span className="font-medium">E-mail:</span> {universityData.email}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-gray-700 font-medium mb-2">Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="text-sm font-medium">{universityData.university_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Program</p>
                            <p className="text-sm font-medium">{universityData.program}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Acceptance Rate</p>
                            <p className="text-sm font-medium">{universityData.acceptance_rate}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Application Fee</p>
                            <p className="text-sm font-medium">${universityData.application_fee}</p>
                          </div>
                        </div>
                      </div>

                      {universityData.website_url && (
                        <div className="mb-6">
                          <h3 className="text-gray-700 font-medium mb-2">Website</h3>
                          <a 
                            href={universityData.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {universityData.website_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UniversityManagement;