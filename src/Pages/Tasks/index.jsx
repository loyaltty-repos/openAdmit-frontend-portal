import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import AppSidebar from '../../components/AppSidebar';
import SidebarHeader from '../../components/SidebarHeader';
import { ChevronDown, ChevronUp, AlignJustify } from 'lucide-react';
import { getStudentTimeline } from '../../services/timelineService';
import { useParams } from 'react-router-dom';

const Tasks = () => {
  const { studentId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  const convertApiDataToUiFormat = (apiData) => {
    if (!apiData || !apiData.timeline || apiData.timeline.length === 0) {
      return [];
    }

    const sections = [];
    const sectionMap = {};

    apiData.timeline.forEach(item => {
      if (!item.task || !item.task._id || !Array.isArray(item.subtasks)) return;
      
      const taskTitle = item.task.title || '';
      const sectionId = item.task._id;
      
      if (!sectionMap[sectionId]) {
        const newSection = {
          id: sectionId,
          title: taskTitle,
          tasks: []
        };
        
        if (taskTitle.toLowerCase().includes('ucla') || taskTitle.toLowerCase().includes('los angeles')) {
          newSection.university = 'UCLA';
        } else if (taskTitle.toLowerCase().includes('stanford')) {
          newSection.university = 'Stanford';
        }
        
        if (taskTitle.toLowerCase().includes('resume master') || 
            taskTitle.toLowerCase().includes('sop variant stanford')) {
          newSection.showLogoAfter = true;
        }
        
        sections.push(newSection);
        sectionMap[sectionId] = newSection;
        
        setExpandedSections(prev => ({
          ...prev,
          [sectionId]: prev[sectionId] !== undefined ? prev[sectionId] : false
        }));
      }
      
      const formattedTasks = item.subtasks.map(subtask => ({
        id: subtask._id,
        title: subtask.title,
        completed: subtask.status === 'COMPLETED' || subtask.status === 'completed',
        locked: subtask.isLocked,
        logo: subtask.logo || null
      }));
      
      if (formattedTasks.length > 0) {
        sectionMap[sectionId].tasks = formattedTasks;
      }
    });
    
    return sections;
  };
  
  useEffect(() => {
    const fetchTimelineData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getStudentTimeline(studentId, {
          page: pagination.page,
          limit: pagination.limit
        });
        
        if (response && 
            response.data && 
            response.data.timeline && 
            Array.isArray(response.data.timeline) && 
            response.data.timeline.length > 0) {
          
          const processedData = convertApiDataToUiFormat(response.data);
          setTimelineData(processedData);
          
          setPagination(prev => ({
            ...prev,
            totalPages: response.data.pages || 1,
            totalItems: response.data.total || 0,
            page: response.data.currentPage || prev.page,
            limit: response.data.limit || prev.limit
          }));
        } else {
          setTimelineData([]);
        }
      } catch (err) {
        console.error("Error fetching timeline data:", err);
        setError("Failed to fetch timeline data. Please try again later.");
        setTimelineData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimelineData();
  }, [studentId, pagination.page, pagination.limit]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const hasData = timelineData && timelineData.length > 0;
  const hasPagination = pagination.totalPages > 1;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar isSidebarOpen={isSidebarOpen} />
        
        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto p-4 pt-8 md:p-6 md:pt-10">
            <div className="max-w-5xl mx-auto">
                
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Checklist & Tasks
                {loading && <span className="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-primary-1 animate-spin"></span>}
              </h2>
              
              {error && <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">{error}</div>}
              
              <div className="rounded-md space-y-4 p-4">
                {hasData ? (
                  timelineData.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-md ">
                    <div 
                      className="flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection(section.id)}
                    >
                      <AlignJustify className="h-4 w-4 text-primary-1 mr-2" />
                      <span className="font-medium text-gray-800">{section.title}</span>
                      <div className="ml-auto">
                        {expandedSections[section.id] ? 
                          <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                          <ChevronDown className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>

                    {expandedSections[section.id] && (
                      <>
                        {section.university === 'UCLA' && (
                          <div className="px-12 py-2 border-t border-gray-200">
                            <div className="bg-blue-800 inline-block px-4 py-2 text-white font-semibold">
                              UCLA
                            </div>
                          </div>
                        )}
                        
                        {section.university === 'Stanford' && (
                          <div className="px-12 py-2 border-t border-gray-200">
                            <div className="bg-red-600 inline-block p-1.5">
                              <span className="text-white font-bold">S</span>
                            </div>
                          </div>
                        )}
                        
                        {section.tasks.length > 0 && (
                          <div className="border-t border-gray-100">
                            {section.tasks.map((task) => (
                              <div key={task.id} className="flex items-center py-2 px-10">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                                  task.locked 
                                    ? 'bg-white text-gray-400 border border-gray-200' 
                                    : task.completed 
                                      ? 'bg-primary-1 text-white border-0' 
                                      : 'border border-gray-400'
                                }`}>
                                  {task.locked 
                                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg> 
                                    : task.completed && 
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>}
                                </div>
                                <span className={`${task.locked ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                                  {task.title}
                                </span>
                                {task.logo && (
                                  <img
                                    src={task.logo}
                                    alt=""
                                    className="ml-auto h-6 w-6 object-contain"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {section.showLogoAfter && section.title.toLowerCase().includes('resume master') && (
                          <div className="px-12 py-2 border-t border-gray-200">
                            <div className="bg-blue-800 inline-block px-4 py-2 text-white font-semibold">
                              UCLA
                            </div>
                          </div>
                        )}
                        
                        {section.showLogoAfter && section.title.toLowerCase().includes('sop variant stanford') && (
                          <div className="px-12 py-2 border-t border-gray-200">
                            <div className="bg-red-600 inline-block p-1.5">
                              <span className="text-white font-bold">S</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  ))
                ) : !loading && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-gray-200 rounded-md">
                    <div className="text-gray-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No tasks found</h3>
                    <p className="text-gray-500 max-w-md">
                      There are no tasks or checklist items available for you at the moment.
                    </p>
                  </div>
                )}
              </div>
              
              {hasData && hasPagination && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded-md border ${
                      pagination.page === 1 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 rounded-md ${
                        pagination.page === i + 1
                          ? 'bg-primary-1 text-white border-primary-1'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-3 py-1 rounded-md border ${
                      pagination.page === pagination.totalPages 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
              
              {hasData && (
                <div className="text-xs text-center text-gray-500 mt-2">
                  Showing page {pagination.page} of {pagination.totalPages} 
                  ({pagination.totalItems} total items)
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Tasks;