import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/auth';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Search,
  Eye,
  Upload,
  Download,
  FileText,
  Loader2,
  TrashIcon,
  Filter,
  X,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getDocuments, updateDocument, uploadDocument, deleteDocument } from '@/services/documentService';
import { getTasksByStudentId } from '@/services/taskService';
import { getSubtasksByTaskAndStudent } from '@/services/subtaskService';
import { getStudents } from '@/services/studentService';
import { uploadFile } from '@/services/uploadService';
import { createPortal } from 'react-dom';

const Documents = ({ studentId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // Track individual action loading states

  const hasEditPermission = () => {
    const currentUser = getUser();
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input state for debouncing
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [documentPagination, setDocumentPagination] = useState({});

  // Upload dialog states
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUploadFileType, setSelectedUploadFileType] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(studentId || '');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});

  // File type options
  const fileTypeOptions = [
    { value: 'all', label: 'All File Types' },
    { value: 'PDF', label: 'PDF' },
    { value: 'DOC', label: 'DOC' },
    { value: 'DOCX', label: 'DOCX' },
    { value: 'JPG', label: 'JPG' },
    { value: 'PNG', label: 'PNG' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'created', label: 'Date Created' },
    { value: 'uploaded', label: 'Date Uploaded' },
    { value: 'name', label: 'File Name' },
    { value: 'size', label: 'File Size' },
    { value: 'status', label: 'Status' },
    { value: 'type', label: 'File Type' }
  ];

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setCurrentPage(1); // Reset to first page when searching
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  const validateFile = (file) => {
    const validFileTypes = {
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/msword': 'DOC',
      'image/jpeg': 'JPG',
      'image/png': 'PNG'
    };

    const fileType = validFileTypes[file.type];
    if (!fileType) {
      toast.error(`Please upload a valid file type (${Object.values(validFileTypes).join(', ')})`);
      return null;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast.error('File size should be less than 10MB');
      return null;
    }

    return fileType;
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setActiveTab('all');
    setSelectedFileType('');
    setDateFrom('');
    setDateTo('');
    setSortBy('created');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Handle filter changes that should reset search
  const handleFilterChange = (filterSetter, value) => {
    filterSetter(value);
    setCurrentPage(1);
    // Reset search when other filters are applied to avoid conflicts
    if (searchQuery || searchInput) {
      setSearchInput('');
      setSearchQuery('');
    }
  };

  // Memoized fetch parameters to prevent unnecessary API calls
  const fetchParams = useMemo(() => ({
    page: currentPage,
    limit: 10,
    status: activeTab === 'all' ? '' : activeTab,
    search: searchQuery,
    fileType: selectedFileType === 'all' ? '' : selectedFileType,
    dateFrom: dateFrom,
    dateTo: dateTo,
    sortBy: sortBy,
    sortOrder: sortOrder
  }), [currentPage, activeTab, searchQuery, selectedFileType, dateFrom, dateTo, sortBy, sortOrder]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDocuments(fetchParams);

      if (!response?.data?.documents) {
        throw new Error('Invalid response from server');
      }

      const mappedDocs = response.data.documents.map(doc => ({
        id: doc._id,
        name: doc.fileName,
        size: `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`,
        student: doc.studentId?.name || 'N/A',
        task: doc.taskId?.title || 'N/A',
        subtask: doc.subtaskId?.title || 'N/A',
        uploadDate: new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString(),
        status: doc.status,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType
      }));

      setDocuments(mappedDocs);
      setDocumentPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
      setDocumentPagination({});
      toast.error(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [fetchParams]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleStatusChange = async (docId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [`status_${docId}`]: true }));
      await updateDocument(docId, { status: newStatus.toUpperCase() });
      await fetchDocuments();
      toast.success(`Document marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update document status');
    } finally {
      setActionLoading(prev => ({ ...prev, [`status_${docId}`]: false }));
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`delete_${docId}`]: true }));
      await deleteDocument(docId);
      await fetchDocuments();
      toast.success('Document deleted successfully');
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete_${docId}`]: false }));
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validType = validateFile(file);
      if (validType) {
        setSelectedFile(file);
        setSelectedUploadFileType(validType);
      } else {
        setSelectedUploadFileType('');
        event.target.value = null;
      }
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setSelectedUploadFileType('');
    setSelectedTask('');
    setSelectedSubtask('');
    if (!studentId) {
      setSelectedStudent('');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedTask || !selectedSubtask || !selectedStudent || !selectedUploadFileType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploadLoading(true);

      const fileFormData = new FormData();
      fileFormData.append('file', selectedFile);
      fileFormData.append('category', 'documents');

      const uploadResponse = await uploadFile(fileFormData);

      if (!uploadResponse?.data?.url) {
        throw new Error('Failed to get uploaded file URL');
      }

      const documentData = new FormData();
      documentData.append('studentId', selectedStudent);
      documentData.append('taskId', selectedTask);
      documentData.append('subtaskId', selectedSubtask);
      documentData.append('fileUrl', uploadResponse.data.url);
      documentData.append('fileName', selectedFile.name);
      documentData.append('fileSize', selectedFile.size);
      documentData.append('fileType', selectedUploadFileType);

      await uploadDocument(documentData);
      await fetchDocuments();

      setIsUploadDialogOpen(false);
      toast.success('Document uploaded successfully');
      resetUploadForm();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadLoading(false);
    }
  };

  const fetchTasks = useCallback(async (studentId) => {
    if (!studentId) {
      setTasks([]);
      return;
    }

    try {
      setTasksLoading(true);
      const response = await getTasksByStudentId({ studentId });
      const tasksData = response.data?.task || [];

      if (!Array.isArray(tasksData)) {
        throw new Error('Invalid tasks data received');
      }

      const mappedTasks = tasksData.map(task => ({
        _id: task.taskId._id,
        id: task.taskId._id,
        title: task.taskId.title || 'Untitled Task',
        assignedAt: task.assignedAt,
        status: task.status,
        dueDate: task.dueDate,
        priority: task.taskId.priority,
        assignmentId: task._id
      }));

      setTasks(mappedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchSubtasks = useCallback(async (taskId) => {
    if (!taskId || !selectedStudent) {
      setSubtasks([]);
      return;
    }
    try {
      setSubtasksLoading(true);
      const response = await getSubtasksByTaskAndStudent(taskId, selectedStudent);
      const subtasksData = response.subTasks || [];

      if (!Array.isArray(subtasksData)) {
        throw new Error('Invalid subtasks data received');
      }

      const mappedSubtasks = subtasksData.map(subtask => {
        let title = '';
        if (subtask.title && typeof subtask.title === 'string' && subtask.title.trim()) {
          title = subtask.title;
        } else if (subtask.name && typeof subtask.name === 'string' && subtask.name.trim()) {
          title = subtask.name;
        } else if (subtask.taskId && subtask.taskId.title) {
          title = `${subtask.taskId.title}`;
        } else {
          title = String(subtask.subtaskId);
        }

        return {
          _id: subtask.subtaskId,
          id: subtask.subtaskId,
          assignmentId: subtask._id,
          taskId: subtask.taskId?._id || subtask.taskId,
          status: subtask.status,
          dueDate: subtask.dueDate,
          assignedAt: subtask.assignedAt,
          title
        };
      });

      setSubtasks(mappedSubtasks);
    } catch (err) {
      setSubtasks([]);
      console.error('Error fetching subtasks:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch subtasks');
    } finally {
      setSubtasksLoading(false);
    }
  }, [selectedStudent]);

  const fetchStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      const response = await getStudents();
      const studentsData = response.data?.students || [];

      if (!Array.isArray(studentsData)) {
        throw new Error('Invalid students data received');
      }

      setStudents(studentsData);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchTasks(selectedStudent);
    }
    if (!studentId) {
      fetchStudents();
    }
  }, [selectedStudent, studentId, fetchTasks, fetchStudents]);

  useEffect(() => {
    if (selectedTask) {
      fetchSubtasks(selectedTask);
    }
  }, [selectedTask, fetchSubtasks]);

  useEffect(() => {
    if (studentId) {
      setSelectedStudent(studentId);
    }
  }, [studentId]);

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto md:p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Document Manager</h1>
        <div className="text-sm text-muted-foreground">
          Total: {documentPagination.total || 0} documents
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-background border rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Reset All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchInput}
              onChange={handleSearch}
              className="pl-8 pr-8"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {searchInput && searchInput !== searchQuery && (
              <div className="absolute right-8 top-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* File Type Filter */}
          <div>
            <Select
              className="w-full"
              value={selectedFileType}
              onValueChange={(value) => handleFilterChange(setSelectedFileType, value)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent >
                {fileTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          {/* <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
              className="pl-8"
            />
          </div> */}

          {/* Date To */}
          {/* <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
              className="pl-8"
            />
          </div> */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-fit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className='w-fit'
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
          >
            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>

        {/* Sort Options */}

        {/* Active Filters Display */}
        {(searchQuery || selectedFileType || dateFrom || dateTo || sortBy !== 'created' || sortOrder !== 'asc') && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedFileType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Type: {fileTypeOptions.find(opt => opt.value === selectedFileType)?.label}
              </span>
            )}
            {dateFrom && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                From: {new Date(dateFrom).toLocaleDateString()}
              </span>
            )}
            {dateTo && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                To: {new Date(dateTo).toLocaleDateString()}
              </span>
            )}
            {(sortBy !== 'created' || sortOrder !== 'asc') && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                Sort: {sortOptions.find(opt => opt.value === sortBy)?.label} ({sortOrder})
              </span>
            )}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => handleFilterChange(setActiveTab, value)}>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          </TabsList>
          {hasEditPermission() && (
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              className="bg-primary text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortChange('size')}
                  >
                    <div className="flex items-center gap-2">
                      Size
                      {getSortIcon('size')}
                    </div>
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Subtask</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortChange('uploaded')}
                  >
                    <div className="flex items-center gap-2">
                      Upload Date
                      {getSortIcon('uploaded')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSortChange('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading documents...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 opacity-50" />
                        <span>No documents found</span>
                        {(searchQuery || selectedFileType || dateFrom || dateTo) && (
                          <Button variant="outline" size="sm" onClick={handleResetFilters}>
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-blue-500" />
                          <div className="max-w-[200px]">
                            <h1 className='truncate' title={doc.name}>{doc.name}</h1>
                            <span className="text-xs text-muted-foreground">{doc.fileType}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{doc.student}</TableCell>
                      <TableCell>{doc.task}</TableCell>
                      <TableCell>{doc.subtask}</TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                          ${doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              doc.status === 'PENDING' ? 'bg-gray-100 text-gray-700' :
                                'bg-gray-100 text-gray-700'
                          }`}
                          style={{ minWidth: 70, justifyContent: 'center' }}>
                          {doc.status === 'VERIFIED' && 'VERIFIED'}
                          {doc.status === 'PENDING' && 'PENDING'}
                          {doc.status === 'REJECTED' && 'REJECTED'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center" style={{ verticalAlign: 'middle', padding: 0 }}>
                        <div className="flex items-center gap-4 justify-center" style={{ height: '100%' }}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={async () => {
                              try {
                                const response = await fetch(doc.fileUrl);
                                if (!response.ok) throw new Error('Network error');

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = doc.name || 'document';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                console.error('Download failed:', err);
                                toast.error('Failed to download. Opening in new tab...');
                                window.open(doc.fileUrl, '_blank');
                              }
                            }}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {hasEditPermission() && (
                            <>
                              <div className="relative" style={{ display: 'inline-block' }}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="More Actions"
                                  disabled={actionLoading[`status_${doc.id}`]}
                                  onClick={e => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setDropdownPosition({
                                      top: rect.bottom + window.scrollY,
                                      left: rect.right + window.scrollX - 160
                                    });
                                    setOpenDropdownId(openDropdownId === doc.id ? null : doc.id);
                                  }}
                                >
                                  {actionLoading[`status_${doc.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <span style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: 2 }}>⋯</span>
                                  )}
                                </Button>
                                {openDropdownId === doc.id && createPortal(
                                  <div className="fixed bg-white border rounded shadow-md min-w-[160px] mt-2" style={{ zIndex: 99999, top: dropdownPosition.top, left: dropdownPosition.left }}>
                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                      onClick={() => {
                                        handleStatusChange(doc.id, 'verified');
                                        setOpenDropdownId(null);
                                      }}
                                      disabled={actionLoading[`status_${doc.id}`]}
                                    >
                                      Mark as Verified
                                    </button>
                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                      onClick={() => {
                                        handleStatusChange(doc.id, 'pending');
                                        setOpenDropdownId(null);
                                      }}
                                      disabled={actionLoading[`status_${doc.id}`]}
                                    >
                                      Mark as Pending
                                    </button>
                                    <button
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 cursor-pointer"
                                      onClick={() => {
                                        handleStatusChange(doc.id, 'rejected');
                                        setOpenDropdownId(null);
                                      }}
                                      disabled={actionLoading[`status_${doc.id}`]}
                                    >
                                      Mark as Rejected
                                    </button>
                                  </div>,
                                  document.body
                                )}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteDocument(doc.id)}
                                title="Delete"
                                disabled={actionLoading[`delete_${doc.id}`]}
                              >
                                {actionLoading[`delete_${doc.id}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                                ) : (
                                  <TrashIcon className="h-4 w-4 text-red-600 cursor-pointer" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {documentPagination && documentPagination.totalPages > 1 && (
          <div className="flex justify-center items-center my-4 text-xs gap-4">
            <Button
              variant="outline"
              disabled={!documentPagination.hasPrevPage}
              onClick={() => setCurrentPage(documentPagination.page - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2">
                Page {documentPagination.page} of {documentPagination.totalPages}
              </span>
              <span className="text-muted-foreground">
                ({documentPagination.total} total)
              </span>
            </div>
            <Button
              variant="outline"
              disabled={!documentPagination.hasNextPage}
              onClick={() => setCurrentPage(documentPagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
        if (!open) resetUploadForm();
        setIsUploadDialogOpen(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for a student&apos;s task or subtask.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!studentId && (
              <div>
                <Label>Student</Label>
                <Select
                  value={selectedStudent || undefined}
                  onValueChange={value => {
                    setSelectedStudent(value);
                    setSelectedTask('');
                    setSelectedSubtask('');
                  }}
                  disabled={studentsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Student">
                      {(() => {
                        const s = students.find(s => s._id === selectedStudent);
                        if (!s) return null;
                        if (s.firstName || s.lastName) {
                          return `${s.firstName || ''} ${s.lastName || ''}`.trim();
                        }
                        return s.email;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {students.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        {studentsLoading ? 'Loading...' : 'No students available'}
                      </SelectItem>
                    ) : (
                      students.map(student => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.firstName || student.lastName ?
                            `${student.firstName || ''} ${student.lastName || ''}`.trim() :
                            student.email
                          }
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Task</Label>
              <Select
                value={selectedTask || undefined}
                onValueChange={value => {
                  setSelectedTask(value);
                  setSelectedSubtask('');
                }}
                disabled={!selectedStudent || tasksLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Task">
                    {selectedTask && tasks.find(t => t._id === selectedTask)?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tasks.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      {tasksLoading ? 'Loading...' : 'No tasks available'}
                    </SelectItem>
                  ) : (
                    tasks.map(task => (
                      <SelectItem key={task._id} value={task._id}>
                        {task.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subtask</Label>
              <Select
                value={selectedSubtask || undefined}
                onValueChange={setSelectedSubtask}
                disabled={!selectedTask || subtasksLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Subtask">
                    {selectedSubtask && (subtasks.find(s => s._id === selectedSubtask)?.title || selectedSubtask)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subtasks.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      {subtasksLoading ? 'Loading...' : 'No subtasks available'}
                    </SelectItem>
                  ) : (
                    subtasks.map(subtask => (
                      <SelectItem key={subtask._id} value={subtask._id}>
                        {subtask.title || subtask._id}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Document File</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({selectedUploadFileType})
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetUploadForm();
                setIsUploadDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedFile || !selectedTask || !selectedSubtask || !selectedStudent || uploadLoading}
              onClick={handleUploadDocument}
            >
              {uploadLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

Documents.propTypes = {
  studentId: PropTypes.string
};

Documents.defaultProps = {
  studentId: ''
};

export default Documents;