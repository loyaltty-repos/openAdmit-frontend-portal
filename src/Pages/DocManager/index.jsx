import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import AppSidebar from '../../components/AppSidebar';
import SidebarHeader from '../../components/SidebarHeader';
import { getStudentDocuments } from '@/services/studentDocumentService';
import { toast } from 'sonner';

const DocManager = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        // Try to get studentId from localStorage, session, or user context
        let studentId = null;
        // Example: if you store user info in localStorage
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user && user._id) studentId = user._id;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
        // Optionally, fallback to sessionStorage or other auth context
        // If studentId is still not found, show error and return
        if (!studentId) {
          toast.error('Student ID not found. Please log in again.');
          setIsLoading(false);
          return;
        }
        const response = await getStudentDocuments({ studentId, page: pagination.page, limit: pagination.limit });
        console.log('API response:', response);
        // Check for unauthorized or forbidden
        if (response.status === 401 || response.status === 403) {
          toast.error('Session expired. Please log in again.');
          // Optionally, redirect to login or clear auth here
          return;
        }
        if (response.success) {
          setDocuments(response.data.documents);
          setPagination(response.data.pagination);
        } else {
          toast.error(response.message || 'Failed to fetch documents');
        }
      } catch (error) {
        // Log the error and the error response if available
        console.error('Error fetching documents:', error);
        if (error?.response) {
          console.error('Error response:', error.response);
          if (error.response.status === 401 || error.response.status === 403) {
            toast.error('Session expired. Please log in again.');
            // Optionally, redirect to login or clear auth here
            return;
          }
        }
        toast.error('Failed to fetch documents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [pagination.page, pagination.limit]);

  const toggleCategory = (taskId) => {
    setOpenCategories(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };


  const formatDocuments = documents.map(doc => ({
    id: doc.task._id,
    title: doc.task.title,
    subtasks: doc.subtasks || []
  }));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar isSidebarOpen={isSidebarOpen} />
        
        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
            <div className="w-full">
              <h1 className="text-2xl font-bold text-primary mb-6">Document Manager</h1>                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-md shadow-sm p-4">
                          <div className="animate-pulse flex space-x-4">
                            <div className="w-6 h-6 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : formatDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No documents available</p>
                    </div>
                  ) : (
                    formatDocuments.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-md shadow-sm overflow-hidden">
                      <div 
                        className="bg-white border-b p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleCategory(doc.id)}
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-primary text-white rounded-sm flex items-center justify-center mr-3 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          </div>
                          <h2 className="text-black font-medium">{doc.title}</h2>
                        </div>
                        <div>
                          {openCategories[doc.id] ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>                      {openCategories[doc.id] && doc.subtasks.length > 0 && (
                        <div className="p-4">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Subtask</th>
                                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {doc.subtasks.map((subtask) => (
                                  <tr key={subtask.id} className="border-b">
                                    <td className="py-2 px-4 text-sm text-gray-800">{subtask.title}</td>
                                    <td className="py-2 px-4 text-right">
                                      {subtask.documents && subtask.documents.length > 0 ? (
                                        <button
                                          className="text-primary hover:text-primary-2"
                                          onClick={() => {
                                            const file = subtask.documents[0];
                                            if (file && file.fileUrl) {
                                              window.open(file.fileUrl, '_blank');
                                            } else {
                                              toast.error('No file available for download');
                                            }
                                          }}
                                        >
                                          <Download className="h-5 w-5 cursor-pointer" />
                                        </button>
                                      ) : (
                                        <span className="text-gray-400">No file</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )))}
                </div>
              
              {!isLoading && documents.length > 0 && (
                <div className="flex justify-center mt-6 gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 text-sm text-gray-600 bg-white rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 text-sm text-gray-600 bg-white rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DocManager;