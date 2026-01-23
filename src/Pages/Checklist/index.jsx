import { useState, useEffect, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import AppSidebar from '../../components/AppSidebar';
import SidebarHeader from '../../components/SidebarHeader';
import { Check, LockKeyhole, ChevronLeft, ChevronRight, FileText, ExternalLink, ChevronDown } from 'lucide-react';
import { getStudentTasks, getStudentDocuments, updateDocumentStatus } from '@/services/taskService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['DRAFT', 'COMPLETED', 'IN_REVIEW', 'REJECTED'];
const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  COMPLETED: 'bg-green-100 text-green-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800'
};

const Checklist = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoadingTasks(true);
      const response = await getStudentTasks({
        sortOrder: 'desc',
        page: currentPage,
        limit: 10
      });

      if (response.success) {
        setTasks(response.data.tasks);
        setPagination(response.data.pagination);
        // Auto-select first task only if no selection
        if (response.data.tasks.length > 0 && selectedTaskId === null) {
          setSelectedTaskId(response.data.tasks[0]._id);
        }
      } else {
        toast.error('Failed to fetch tasks');
      }
    } catch (error) {
      toast.error('Error fetching tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [currentPage]);

  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const response = await getStudentDocuments();
      if (response.success && response.data.documents) {
        setDocuments(response.data.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  const handleStatusUpdate = async (docId, newStatus) => {
    setUpdatingId(docId);
    const response = await updateDocumentStatus(docId, newStatus);
    if (response.success) {
      toast.success('Status updated');
      setDocuments(prev => prev.map(doc => 
        doc._id === docId ? { ...doc, status: newStatus } : doc
      ));
    } else {
      toast.error(response.message || 'Update failed');
    }
    setUpdatingId(null);
  };

  useEffect(() => {
    fetchTasks();
    fetchDocuments();
  }, [fetchTasks, fetchDocuments]);

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    setSelectedDocumentId(null); // Clear document selection
  };

  const handleDocumentClick = (docId) => {
    setSelectedDocumentId(docId);
    setSelectedTaskId(null); // Clear task selection
  };

  const handleQuestionnaireClick = (taskId, subtaskId) => {
    navigate(`/questionnaires/${taskId}/${subtaskId}`);
  };

  const selectedTask = tasks.find(t => t._id === selectedTaskId);
  const subtasks = selectedTask?.subtasks || [];
  const selectedDocument = documents.find(d => d._id === selectedDocumentId);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar isSidebarOpen={isSidebarOpen} />

        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side: Tasks & Documents */}
              <div className="w-full lg:w-1/3 space-y-8">
                {/* Tasks Section */}
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-4">Tasks</h2>

                  {isLoadingTasks ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="mb-4 rounded-lg overflow-hidden bg-white animate-pulse">
                        <div className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task._id}
                        onClick={() => handleTaskClick(task._id)}
                        className={`mb-4 rounded-lg overflow-hidden cursor-pointer ${
                          task._id === selectedTaskId ? 'bg-primary text-white' : 'bg-white'
                        }`}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex-grow">
                            <h3 className={`font-medium ${task._id === selectedTaskId ? 'text-white' : 'text-primary'}`}>
                              {task.title}
                            </h3>
                            <p className={`text-sm mt-1 ${task._id === selectedTaskId ? 'text-white' : 'text-gray-700'}`}>
                              {task.description || 'No description'}
                            </p>
                            <p className={`text-xs ${task._id === selectedTaskId ? 'text-gray-200' : 'text-gray-500'}`}>
                              Priority: {task.priority}
                            </p>
                          </div>
                          {task.subtasks?.every(st => !st.isLocked) ? (
                            <div className={`rounded-full p-1 ${task._id === selectedTaskId ? 'bg-white' : 'bg-primary'}`}>
                              <Check className={`h-5 w-5 ${task._id === selectedTaskId ? 'text-primary' : 'text-white'}`} />
                            </div>
                          ) : (
                            <LockKeyhole className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Documents Section - SAME UI AS TASKS */}
                <div>
                  <h2 className="text-xl font-semibold text-primary mb-4">Documents</h2>

                  {isLoadingDocs ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="mb-4 rounded-lg overflow-hidden bg-white animate-pulse">
                        <div className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : documents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No documents uploaded</p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc._id}
                        onClick={() => handleDocumentClick(doc._id)}
                        className={`mb-4 rounded-lg overflow-hidden cursor-pointer ${
                          doc._id === selectedDocumentId ? 'bg-primary text-white' : 'bg-white'
                        }`}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex-grow">
                            <h3 className={`font-medium ${doc._id === selectedDocumentId ? 'text-white' : 'text-primary'}`}>
                              {doc.documentName}
                            </h3>
                            <p className={`text-sm mt-1 ${doc._id === selectedDocumentId ? 'text-white' : 'text-gray-700'}`}>
                              {doc.priority || 'No priority'}
                            </p>
                            <p className={`text-xs ${doc._id === selectedDocumentId ? 'text-gray-200' : 'text-gray-500'}`}>
                              Created: {new Date(doc.createdDate).toLocaleDateString()}
                            </p>
                          </div>
                          <FileText className={`h-6 w-6 ${doc._id === selectedDocumentId ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="flex-1 mt-10">
                <div className="bg-white rounded-lg shadow-sm p-5">
                  {/* Subtasks View */}
                  {selectedTaskId && selectedTask && (
                    <>
                      <h2 className="text-xl font-semibold text-black mb-4">
                        Subtasks in {selectedTask.title}
                      </h2>
                      {subtasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No subtasks available</p>
                      ) : (
                        subtasks.map((subtask) => (
                          <div key={subtask._id} className={`mb-4 p-4 rounded-lg ${subtask.isLocked ? 'bg-gray-100' : 'bg-primary/10'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {subtask.isLocked && <LockKeyhole className="h-5 w-5 text-gray-400 mr-2" />}
                                <h3 className="font-medium text-gray-800">{subtask.title}</h3>
                              </div>
                              {!subtask.isLocked && (
                                <button
                                  onClick={() => handleQuestionnaireClick(selectedTask._id, subtask._id)}
                                  className="bg-primary hover:bg-teal-800 text-white text-xs font-medium py-2 px-5 rounded"
                                >
                                  Goto Questionnaire
                                </button>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <span>Assigned to: Me</span>
                              <span className="mx-2">|</span>
                              <span>Deadline: {subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString() : 'Not set'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* Document Details View */}
                  {selectedDocumentId && selectedDocument && (
                    <>
                      <h2 className="text-xl font-semibold text-black mb-4">
                        {selectedDocument.documentName}
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Document Link</p>
                          <a
                            href={selectedDocument.documentURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-lg font-medium flex items-center gap-2"
                          >
                            Open Document <ExternalLink className="h-5 w-5" />
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Priority</p>
                          <p className="font-medium">{selectedDocument.priority}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="relative inline-block">
                            <select
                              value={selectedDocument.status || 'DRAFT'}
                              onChange={(e) => handleStatusUpdate(selectedDocument._id, e.target.value)}
                              disabled={updatingId === selectedDocument._id}
                              className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 text-sm cursor-pointer"
                            >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="font-medium">{new Date(selectedDocument.createdDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Initial Empty State */}
                  {!selectedTaskId && !selectedDocumentId && (
                    <p className="text-gray-500 text-center py-8">
                      Select a task or document to view details
                    </p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Checklist;