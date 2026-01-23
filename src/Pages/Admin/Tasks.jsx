import { useState, useEffect, useMemo } from 'react';
import { servicesAxiosInstance } from '@/services/config';
import { getUser } from '@/lib/auth';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addStudentsToTask,
  removeStudentFromTask,
  addSubtasksToTask,
  removeSubtaskFromTask,
  updateTaskSubtaskAssignment,
  getDocuments,
  deleteDocument
} from '@/services/taskService';
import { getSubtasks, getSubtasksByTaskAndStudent } from '@/services/subtaskService';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/taskCategoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
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
import {
  Plus,
  Loader2,
  X,
  Briefcase,
  Link,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import TaskPopup from './TaskPopup';
import DocumentsPopup from './components/DocumentsPopup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const normalize = (v) => (v ?? '').toString().trim().toLowerCase();

const Tasks = () => {
  const [mainTaskCategories, setMainTaskCategories] = useState([]);
  const [selectedMainTask, setSelectedMainTask] = useState('');
  const [viewTask, setViewTask] = useState(null);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [documentPagination, setDocumentPagination] = useState({});
  const [currentDocumentPage, setCurrentDocumentPage] = useState(1);

  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'documents'
  const [deletingId, setDeletingId] = useState(null);

  // ✅ SEARCH STATES
  const [taskSearch, setTaskSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [debouncedTaskSearch, setDebouncedTaskSearch] = useState('');
  const [debouncedDocSearch, setDebouncedDocSearch] = useState('');

  // Permission check functions
  const hasAdminPermission = () => {
    const currentUser = getUser();
    return currentUser && currentUser.role === 'ADMIN';
  };

  const hasEditPermission = () => {
    const currentUser = getUser();
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
  };

  const subtaskTemplates = {
    'Application Documents': ['Draft SOP', 'Review with counselor', 'Final submission'],
    'Test Preparation': ['Mock test', 'Review session', 'Practice questions'],
    'Financial Documentation': ['Bank statements', 'Affidavit preparation', 'Source of funds'],
    'Visa Application': ['Form filling', 'Document preparation', 'Interview preparation'],
    'University Selection': ['Research universities', 'Shortlist options', 'Compare programs']
  };

  const [loading, setLoading] = useState({
    tasks: false,
    add: false,
    edit: false,
    delete: false,
    students: false,
    subtasks: false,
    members: false,
    categories: false
  });

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableSubtasks, setAvailableSubtasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [selectedStudentDetails, setSelectedStudentDetails] = useState([]);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'HIGH',
    logo: '',
    assignee: ''
  });

  const STATUS_COLORS = {
    COMPLETED: 'text-green-600',
    IN_PROGRESS: 'text-yellow-600',
    PENDING: 'text-red-600',
    default: 'text-gray-500',
  };

  // State for task details dialog
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedStudentForTask, setSelectedStudentForTask] = useState(null);
  const [studentSubtasks, setStudentSubtasks] = useState([]);

  // State for category management dialog
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [newCategoryData, setNewCategoryData] = useState({ name: '', description: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});

  // Student dropdown
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPagination, setStudentPagination] = useState({});
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // ✅ debounce task search (so it doesn't refetch on every keystroke)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTaskSearch(taskSearch), 250);
    return () => clearTimeout(t);
  }, [taskSearch]);

  // ✅ debounce doc search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedDocSearch(docSearch), 250);
    return () => clearTimeout(t);
  }, [docSearch]);

  const validateTaskData = (data) => {
    if (!data.title?.trim()) {
      toast.error('Task title is required');
      return false;
    }
    return true;
  };

  const handleMainTaskChange = (value) => setSelectedMainTask(value);

  // fetchStudents
  const fetchStudents = async (searchQuery = studentSearch, page = 1) => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const params = { search: searchQuery, page, limit: 10 };
      const response = await servicesAxiosInstance.get('/admin/students', { params });
      if (response.data.success) {
        setStudents(response.data.data.students.map(student => ({
          id: student._id,
          name: student.name || student.email,
          email: student.email
        })));
        setStudentPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentSearch]);

  // ✅ fetchTasks (now supports optional search param)
  const fetchTasks = async (page = 1, search = debouncedTaskSearch) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));

      // If your backend supports search, it will use it.
      // If not, it will ignore, and client-side filtering will still work.
      const response = await getTasks({
        page,
        limit: 10,
        search: search?.trim() ? search.trim() : undefined,
      });

      const { tasks, pagination } = response.data;

      const transformedTasks = tasks.map(task => ({
        ...task,
        status: task.subtasks.length > 0
          ? task.subtasks.every(st => st.status === 'COMPLETED') ? 'COMPLETED'
            : task.subtasks.some(st => st.status === 'IN_PROGRESS') ? 'IN_PROGRESS'
              : 'PENDING'
          : 'PENDING',
        studentNames: task.students?.map(s => s?.name || s?.email).join(', '),
        subtaskCount: task.subtasks?.length || 0
      }));

      setTasks(transformedTasks);
      setPaginationData(pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const fetchTeamMembers = async () => {
    if (!hasAdminPermission()) return;

    try {
      setLoading(prev => ({ ...prev, members: true }));
      const response = await servicesAxiosInstance.get('/admin/members');
      if (response.data.success) {
        setTeamMembers(
          response.data.data.members
            .filter(member => member.status === 'ACTIVE')
            .map(member => ({
              id: member._id,
              name: `${member.firstName} ${member.lastName}`,
              role: member.role,
              status: member.status
            }))
        );
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch team members');
    } finally {
      setLoading(prev => ({ ...prev, members: false }));
    }
  };

  const fetchSubtasks = async () => {
    try {
      setLoading(prev => ({ ...prev, subtasks: true }));
      const response = await getSubtasks();
      if (response?.data?.subtasks) {
        setAvailableSubtasks(response.data.subtasks.map(subtask => ({
          id: subtask._id,
          title: subtask.title,
          description: subtask.description,
          priority: subtask.priority
        })));
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      toast.error('Failed to fetch subtasks: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, subtasks: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      const response = await getCategories();
      if (response.success) {
        setMainTaskCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // initial load
  useEffect(() => {
    (async () => {
      await fetchTeamMembers();
      await fetchSubtasks();
      await fetchCategories();
      await fetchStudents('', 1);
      await fetchTasks(1, ''); // initial unfiltered
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ when task search changes: reset to page 1 + fetch (server-side if supported)
  useEffect(() => {
    if (activeTab !== 'tasks') return;
    setCurrentPage(1);
    fetchTasks(1, debouncedTaskSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTaskSearch, activeTab]);

  // ✅ Documents fetch (supports optional search param)
  const fetchDocuments = async (page = 1, search = debouncedDocSearch) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true })); // reuse loading state

      const response = await getDocuments({
        page,
        limit: 10,
        search: search?.trim() ? search.trim() : undefined,
      });

      const docs = response.data?.documents || [];
      const totalDocs = response.data?.total || docs.length;

      const transformed = docs.map(doc => ({
        ...doc,
        studentName: doc.student ? (doc.student.name || doc.student.email || '—') : '—',
        assigneeName: doc.assignee
          ? `${doc.assignee.firstName || ''} ${doc.assignee.lastName || ''}`.trim() || doc.assignee.email || '—'
          : '—'
      }));

      setDocuments(transformed);
      setDocumentPagination({
        hasPrevPage: page > 1,
        hasNextPage: docs.length === 10,
        page,
        totalPages: Math.ceil(totalDocs / 10) || 1
      });
      setCurrentDocumentPage(page);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;
    if (!hasEditPermission()) {
      toast.error("You don't have permission to delete tasks");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, delete: true }));
      await deleteTask(taskId);
      await fetchTasks(currentPage, debouncedTaskSearch);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return;
    }

    setDeletingId(documentId);
    try {
      const response = await deleteDocument(documentId);
      if (response.success) {
        toast.success('Document deleted successfully');
        await fetchDocuments(currentDocumentPage, debouncedDocSearch);
      } else {
        toast.error(response.message || 'Failed to delete document');
      }
    } catch (error) {
      toast.error('Error deleting document');
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Load documents when tab changes to documents
  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments(currentDocumentPage, debouncedDocSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentDocumentPage]);

  // ✅ when doc search changes: reset to page 1 + fetch
  useEffect(() => {
    if (activeTab !== 'documents') return;
    setCurrentDocumentPage(1);
    fetchDocuments(1, debouncedDocSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDocSearch, activeTab]);

  const handleSubtaskSelection = async (subtaskId) => {
    const subtask = availableSubtasks.find(s => s?.id === subtaskId);

    if (subtask && !selectedSubtasks.includes(subtask.id)) {
      setSelectedSubtasks([...selectedSubtasks, subtask.id]);

      if (isEditTaskOpen && selectedTask) {
        try {
          setLoading(prev => ({ ...prev, subtasks: true }));
          await addSubtasksToTask(selectedTask._id, { subtaskIds: [subtask.id] });
          toast.success(`Added subtask "${subtask.title}" to task`);
        } catch (error) {
          console.error('Error adding subtask:', error?.response?.data?.message);
          toast.error('Failed to Add Subtask: ' + error?.response?.data?.message);
          setSelectedSubtasks(selectedSubtasks.filter(id => id !== subtask.id));
        } finally {
          setLoading(prev => ({ ...prev, subtasks: false }));
        }
      }
    }
  };

  const handleRemoveSubtask = async (subtaskId) => {
    setSelectedSubtasks(selectedSubtasks.filter(id => id !== subtaskId));

    if (isEditTaskOpen && selectedTask) {
      try {
        setLoading(prev => ({ ...prev, subtasks: true }));
        await removeSubtaskFromTask(selectedTask._id, { subtaskIds: [subtaskId] });
        toast.success('Removed subtask from task');
      } catch (error) {
        console.error('Error removing subtask:', error);
        toast.error('Failed to remove subtask: ' + error.response?.data?.message);
        setSelectedSubtasks([...selectedSubtasks, subtaskId]);
      } finally {
        setLoading(prev => ({ ...prev, subtasks: false }));
      }
    }
  };

  const resetTaskForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'HIGH',
      logo: '',
      assignee: ''
    });
    setSelectedStudents([]);
    setSelectedSubtasks([]);
    setNewSubtask('');
    setSelectedMainTask('');
    setStudentSearch('');
    setIsStudentDropdownOpen(false);
    setSelectedStudentDetails([]);
  };

  const handleOpenEditTask = (task) => {
    if (!hasEditPermission()) {
      toast.error("You don't have permission to edit tasks");
      return;
    }

    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'HIGH',
      logo: task.logo || '',
      assignee: task.assignee || ''
    });

    setSelectedStudents(task.students?.map(s => s?._id) || []);
    setSelectedSubtasks(task.subtasks?.map(s => s?.subtask?._id) || []);
    setSelectedMainTask(task.category || '');
    setIsEditTaskOpen(true);
  };

  const handleSaveStudentAssignment = async () => {
    if (!selectedTask || selectedStudents.length === 0) {
      toast.error('Please select students to assign');
      return;
    }

    if (!hasEditPermission()) {
      toast.error("You don't have permission to assign students to tasks");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, students: true }));

      const currentStudentIds = selectedTask.students?.map(s => s?._id) || [];

      const studentsToAdd = selectedStudents.filter(id => !currentStudentIds.includes(id));
      if (studentsToAdd.length > 0) {
        await addStudentsToTask(selectedTask._id, { studentIds: studentsToAdd });
      }

      const studentsToRemove = currentStudentIds.filter(id => !selectedStudents.includes(id));
      for (const studentId of studentsToRemove) {
        await removeStudentFromTask(selectedTask?._id, { studentId });
      }

      await fetchTasks(currentPage, debouncedTaskSearch);
      setIsAssignStudentOpen(false);
      toast.success('Students assigned successfully!');
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error(error?.response?.data?.message || 'Failed to assign students');
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const handleAddTask = async () => {
    if (!validateTaskData(newTask)) return;
    if (!hasEditPermission()) {
      toast.error("You don't have permission to create tasks");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, add: true }));

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || '',
        priority: newTask.priority.toUpperCase(),
        logo: newTask.logo || '',
        studentIds: selectedStudents,
        subtaskIds: selectedSubtasks
      };

      if (selectedMainTask) taskData.category = selectedMainTask;
      if (newTask.assignee) taskData.assignee = newTask.assignee;

      await createTask(taskData);

      // refresh list (respect current search)
      await fetchTasks(1, debouncedTaskSearch);
      setCurrentPage(1);

      resetTaskForm();
      setIsAddTaskOpen(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error(error?.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask || !validateTaskData(newTask)) return;
    if (!hasEditPermission()) {
      toast.error("You don't have permission to edit tasks");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, edit: true }));

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || '',
        priority: newTask.priority.toUpperCase(),
        logo: newTask.logo || ''
      };

      if (selectedMainTask) taskData.category = selectedMainTask;
      if (newTask.assignee) taskData.assignee = newTask.assignee;

      await updateTask(selectedTask._id, taskData);

      // students diff
      const currentStudentIds = selectedTask.students?.map(s => s?._id) || [];
      const studentsToAdd = selectedStudents.filter(id => !currentStudentIds.includes(id));
      const studentsToRemove = currentStudentIds.filter(id => !selectedStudents.includes(id));

      if (studentsToAdd.length > 0) {
        await addStudentsToTask(selectedTask._id, { studentIds: studentsToAdd });
      }
      for (const studentId of studentsToRemove) {
        await removeStudentFromTask(selectedTask._id, { studentId });
      }

      // subtasks diff
      const currentSubtaskIds = selectedTask.subtasks?.map(s => s?.subtask?._id) || [];
      const subtasksToAdd = selectedSubtasks.filter(id => !currentSubtaskIds.includes(id));
      const subtasksToRemove = currentSubtaskIds.filter(id => !selectedSubtasks.includes(id));

      if (subtasksToAdd.length > 0) {
        await addSubtasksToTask(selectedTask._id, { subtaskIds: subtasksToAdd });
      }
      if (subtasksToRemove.length > 0) {
        await removeSubtaskFromTask(selectedTask._id, { subtaskIds: subtasksToRemove });
      }

      await fetchTasks(currentPage, debouncedTaskSearch);
      setIsEditTaskOpen(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error?.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  // subtasks for a student+task
  const fetchStudentTaskDetails = async (taskId, studentId) => {
    if (!taskId || !studentId) return;

    try {
      setLoading(prev => ({ ...prev, subtasks: true }));
      const response = await getSubtasksByTaskAndStudent(taskId, studentId);
      if (response?.success) setStudentSubtasks(response.data.subtasks || []);
    } catch (error) {
      console.error('Error fetching student task details:', error);
      toast.error('Failed to fetch task details: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, subtasks: false }));
    }
  };

  const handleOpenTaskDetails = (task, studentId) => {
    const student = students.find(s => s?.id === studentId);
    if (!student) return;

    setSelectedTask(task);
    setSelectedStudentForTask(student);
    fetchStudentTaskDetails(task._id, studentId);
    setIsTaskDetailOpen(true);
  };

  const handleUpdateSubtaskStatus = async (assignmentId, status, isLocked = false) => {
    if (!hasEditPermission()) {
      toast.error("You don't have permission to update subtask status");
      return;
    }

    const currentSubtask = studentSubtasks.find(st => st.assignmentId === assignmentId);
    const isStatusChange = currentSubtask && currentSubtask.status !== status;
    const isLockChange = currentSubtask && currentSubtask.isLocked !== isLocked;

    try {
      setLoading(prev => ({ ...prev, subtasks: true }));
      await updateTaskSubtaskAssignment({ assignmentId, status, isLocked });

      if (selectedTask && selectedStudentForTask) {
        await fetchStudentTaskDetails(selectedTask._id, selectedStudentForTask.id);
      }

      if (isStatusChange && isLockChange) toast.success(`Subtask status updated and ${isLocked ? 'locked' : 'unlocked'}`);
      else if (isStatusChange) toast.success('Subtask status updated');
      else if (isLockChange) toast.success(`Subtask ${isLocked ? 'locked' : 'unlocked'}`);
      else toast.success('Subtask updated');
    } catch (error) {
      console.error('Error updating subtask status:', error);
      toast.error('Failed to update subtask status: ' + error.response?.data?.message);
    } finally {
      setLoading(prev => ({ ...prev, subtasks: false }));
    }
  };

  // category manage
  const handleOpenCategoryManage = (category = null) => {
    if (!hasEditPermission()) {
      toast.error("You don't have permission to manage categories");
      return;
    }

    if (category) {
      setCategoryToEdit(category);
      setNewCategoryData({ name: category.name, description: category.description || '' });
    } else {
      setCategoryToEdit(null);
      setNewCategoryData({ name: '', description: '' });
    }
    setIsCategoryManageOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (!hasEditPermission()) {
      toast.error("You don't have permission to create or edit categories");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, categories: true }));
      if (categoryToEdit) {
        await updateCategory(categoryToEdit._id, newCategoryData);
        toast.success('Category updated successfully');
      } else {
        await createCategory(newCategoryData);
        toast.success('Category created successfully');
      }
      await fetchCategories();
      setIsCategoryManageOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error?.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) return;
    if (!hasEditPermission()) {
      toast.error("You don't have permission to delete categories");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, categories: true }));
      await deleteCategory(categoryId);
      await fetchCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // ✅ Client-side filtering (always works)
  const filteredTasks = useMemo(() => {
    const q = normalize(taskSearch);
    if (!q) return tasks;

    return tasks.filter(t => {
      const taskTitle = normalize(t?.title);
      const studentNames = normalize(
        t?.studentNames ||
        (t?.students?.map(s => s?.name || s?.email).join(', ') ?? '')
      );
      return taskTitle.includes(q) || studentNames.includes(q);
    });
  }, [tasks, taskSearch]);

  const filteredDocuments = useMemo(() => {
    const q = normalize(docSearch);
    if (!q) return documents;

    return documents.filter(d => {
      const docName = normalize(d?.documentName);
      const studentName = normalize(d?.studentName);
      return docName.includes(q) || studentName.includes(q);
    });
  }, [documents, docSearch]);

  return (
    <div className="space-y-4  max-w-[100vw] md:max-w-full  overflow-x-auto ">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Tasks & Documents</h1>

        <div className="flex flex-wrap gap-3 items-center justify-start md:justify-end">
          {hasEditPermission() && (
            <>
              <Button onClick={() => setIsAddTaskOpen(true)} size="default" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
              <Button onClick={() => setIsAddDocumentOpen(true)} size="default" className="w-full sm:w-auto">
                <Link className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </>
          )}
          {hasAdminPermission() && (
            <Button variant="outline" onClick={() => setIsCategoryManageOpen(true)} size="default" className="w-full sm:w-auto">
              Manage Categories
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        View and manage all tasks assigned to students
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* ==================== TASKS TAB ==================== */}
        <TabsContent value="tasks">
          {/* ✅ Search bar for Tasks (Task + Student) */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm text-muted-foreground">
              Search by <span className="font-medium">Task</span> or <span className="font-medium">Student</span>
            </div>
            <div className="w-full max-w-sm">
              <Input
                placeholder="Search task / student..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full ">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Task</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Assignee</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading.tasks ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task._id} className="border-b">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium truncate max-w-[100px]" title={task.title}>
                            {task.title}
                          </div>
                          {task.subtasks?.length > 0 && (
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {task.subtasks.length} subtasks
                            </div>
                          )}
                        </div>
                      </td>

                      <td
                        className="px-4 py-3 max-w-[250px] truncate"
                        title={task.students?.map(s => s?.name ?? s?.email ?? '-').join(', ') || '-'}
                      >
                        {task.students?.map(s => s?.name ?? s?.email ?? '-').join(', ') || '-'}
                      </td>

                      <td className="px-4 py-3">
                        {task.assignee ? teamMembers.find(m => m.id === task.assignee)?.name : '-'}
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            task.priority === 'HIGH' ? 'destructive'
                              : task.priority === 'MEDIUM' ? 'warning'
                                : 'secondary'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {hasEditPermission() && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  const currentStudents = task.students || [];
                                  setSelectedStudents(currentStudents.map(s => s._id));
                                  setSelectedStudentDetails(currentStudents.map(s => ({
                                    id: s._id,
                                    name: s.name || s.email,
                                    email: s.email
                                  })));
                                  setIsAssignStudentOpen(true);
                                }}
                              >
                                Assign
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenEditTask(task)}>
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setViewTask(task)}>
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteTask(task._id)}
                                disabled={loading.delete}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (unchanged) */}
          {paginationData && (
            <div className="flex justify-center my-6 gap-2">
              <Button
                variant="outline"
                disabled={!paginationData.hasPrevPage}
                onClick={() => fetchTasks(paginationData.page - 1, debouncedTaskSearch)}
              >
                Previous
              </Button>
              <span className="px-4 py-2">
                Page {paginationData.page} of {paginationData.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!paginationData.hasNextPage}
                onClick={() => fetchTasks(paginationData.page + 1, debouncedTaskSearch)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ==================== DOCUMENTS TAB ==================== */}
        <TabsContent value="documents">
          {/* ✅ Search bar for Documents (Doc + Student) */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm text-muted-foreground">
              Search by <span className="font-medium">Document</span> or <span className="font-medium">Student</span>
            </div>
            <div className="w-full max-w-sm">
              <Input
                placeholder="Search document / student..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Document Name</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Assignee</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading.tasks ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </td>
                  </tr>
                ) : filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => (
                    <tr key={doc._id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{doc.documentName}</td>
                      <td className="px-4 py-3 text-sm">{doc.studentName}</td>
                      <td className="px-4 py-3 text-sm">{doc.assigneeName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={doc.priority?.toLowerCase() || 'secondary'}>
                          {doc.priority || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={doc.status ? STATUS_COLORS[doc.status] || 'secondary' : 'secondary'}>
                          {doc.status || 'DRAFT'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.documentURL, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open Document
                          </Button>
                          {hasEditPermission() && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDocument(doc._id)}
                              disabled={deletingId === doc._id}
                            >
                              {deletingId === doc._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {documentPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDocuments(currentDocumentPage - 1, debouncedDocSearch)}
                  disabled={!documentPagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentDocumentPage} of {documentPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDocuments(currentDocumentPage + 1, debouncedDocSearch)}
                  disabled={!documentPagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={(open) => {
        setIsAddTaskOpen(open);
        if (!open) resetTaskForm();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task and assign it to students.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="mainTask" className="text-sm font-medium">Main Task Category</label>
              <Select value={selectedMainTask} onValueChange={handleMainTaskChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select main task category" />
                </SelectTrigger>
                <SelectContent>
                  {mainTaskCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="taskTitle" className="text-sm font-medium">Task Title</label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Assign to Students</label>
              <div className="relative">
                <button
                  className="w-full border rounded-md p-2 text-left"
                  onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                >
                  Select students
                </button>

                {isStudentDropdownOpen && (
                  <div className="text-xs z-10 w-full bg-white border rounded-md mt-1">
                    <div className="p-2">
                      <Input
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>

                    <ul className="max-h-60 overflow-y-auto">
                      {loading.students ? (
                        <li className="p-4 text-center">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        </li>
                      ) : students.length === 0 ? (
                        <li className="p-4 text-center text-muted-foreground">No students found</li>
                      ) : (
                        students.map(student => {
                          const isSelected = selectedStudents.includes(student.id);
                          return (
                            <li
                              key={student.id}
                              className={`p-2 ml-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${isSelected ? 'bg-gray-100' : ''}`}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                  setSelectedStudentDetails(selectedStudentDetails.filter(s => s.id !== student.id));
                                } else {
                                  setSelectedStudents([...selectedStudents, student.id]);
                                  setSelectedStudentDetails([...selectedStudentDetails, student]);
                                }
                              }}
                            >
                              <span>{student.name} ({student.email})</span>
                              {isSelected && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-blue-600 flex-shrink-0"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </li>
                          );
                        })
                      )}
                    </ul>

                    <div className="flex justify-center p-2">
                      <Button
                        variant="outline"
                        disabled={!studentPagination.hasPrev}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2">
                        {studentPagination.currentPage} of {studentPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!studentPagination.hasNext}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {selectedStudentDetails.length > 0 && (
                <div className="border rounded-md p-2 mt-2">
                  <p className="text-sm font-medium mb-2">Selected Students:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudentDetails.map((student) => {
                      if (!student) return null;
                      return (
                        <Badge
                          key={student.id}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 flex items-center gap-1"
                        >
                          {student.name}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-blue-100 hover:text-blue-700 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTaskDetails(selectedTask, student.id);
                              }}
                              title="View subtasks"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                setSelectedStudentDetails(selectedStudentDetails.filter(s => s.id !== student.id));
                              }}
                              title="Remove student"
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </div>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Subtasks</label>
              <Select value={newSubtask} onValueChange={handleSubtaskSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subtask" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubtasks.map(subtask => (
                    <SelectItem key={subtask.id} value={subtask.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>{subtask.title}</span>
                          <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                        </div>
                        <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSubtasks.length > 0 && (
                <div className="border rounded-md p-2 mt-2">
                  <p className="text-sm font-medium mb-2">Selected Subtasks:</p>
                  <ul className="space-y-1">
                    {selectedSubtasks.map((subtaskId) => {
                      const subtask = availableSubtasks.find(s => s?.id === subtaskId);
                      if (!subtask) return null;
                      return (
                        <li key={subtask.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-sm px-2 py-1">
                          <div>
                            <span>{subtask.title}</span>
                            <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveSubtask(subtask.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {selectedMainTask !== 'create_new' && subtaskTemplates[selectedMainTask]?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Suggested subtasks:</p>
                  <div className="flex flex-wrap gap-1">
                    {subtaskTemplates[selectedMainTask].map((template, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          const matchedSubtask = availableSubtasks.find(s => s?.title === template);
                          if (matchedSubtask && !selectedSubtasks.includes(matchedSubtask.id)) {
                            setSelectedSubtasks([...selectedSubtasks, matchedSubtask.id]);
                          }
                        }}
                      >
                        {template}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <Select value={newTask.priority} onValueChange={(val) => setNewTask({ ...newTask, priority: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="assignee" className="text-sm font-medium">Assignee</label>
                <Select value={newTask.assignee} onValueChange={(val) => setNewTask({ ...newTask, assignee: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{member.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({member.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={loading.add}>
              {loading.add ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Task'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              {selectedTask?.title ? `Edit "${selectedTask.title}"` : 'Edit task'}
              <p className="mt-2 text-xs text-muted-foreground">
                Note: Status and Due Date are managed automatically based on subtask progress.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="mainTask" className="text-sm font-medium">Main Task Category</label>
              <Select value={selectedMainTask} onValueChange={handleMainTaskChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select main task category" />
                </SelectTrigger>
                <SelectContent>
                  {mainTaskCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="taskTitle" className="text-sm font-medium">Task Title</label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium">Subtasks</label>
              <Select value={newSubtask} onValueChange={handleSubtaskSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subtask" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubtasks.map(subtask => (
                    <SelectItem key={subtask.id} value={subtask.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>{subtask.title}</span>
                          <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                        </div>
                        <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSubtasks.length > 0 && (
                <div className="border rounded-md p-2 mt-2">
                  <p className="text-sm font-medium mb-2">Selected Subtasks:</p>
                  <ul className="space-y-1">
                    {selectedSubtasks.map((subtaskId) => {
                      const subtask = availableSubtasks.find(s => s?.id === subtaskId);
                      if (!subtask) return null;
                      return (
                        <li key={subtask.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-sm px-2 py-1">
                          <div>
                            <span>{subtask.title}</span>
                            <span className="text-xs text-muted-foreground block">{subtask.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveSubtask(subtask.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <Select value={newTask.priority} onValueChange={(val) => setNewTask({ ...newTask, priority: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="assignee" className="text-sm font-medium">Assignee</label>
                <Select value={newTask.assignee} onValueChange={(val) => setNewTask({ ...newTask, assignee: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{member.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({member.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={loading.edit}>
              {loading.edit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={isAssignStudentOpen} onOpenChange={setIsAssignStudentOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Students to Task</DialogTitle>
            <DialogDescription>
              {selectedTask?.title ? `Select students to assign to "${selectedTask.title}"` : 'Select students to assign to this task'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="relative text-xs">
              <button className="w-full border rounded-md p-2 text-left" onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}>
                Select students
              </button>

              {isStudentDropdownOpen && (
                <div className=" z-10 w-full bg-white border rounded-md mt-1">
                  <div className="p-2">
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>

                  <ul>
                    {students.map(student => (
                      <li
                        key={student.id}
                        className="p-2 ml-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          if (!selectedStudents.includes(student.id)) {
                            setSelectedStudents([...selectedStudents, student.id]);
                            setSelectedStudentDetails([...selectedStudentDetails, student]);
                          }
                        }}
                      >
                        {student.name} ({student.email})
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-center p-2">
                    <Button
                      variant="outline"
                      disabled={!studentPagination.hasPrev}
                      onClick={() => fetchStudents(studentSearch, studentPagination.currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2">
                      {studentPagination.currentPage} of {studentPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={!studentPagination.hasNext}
                      onClick={() => fetchStudents(studentSearch, studentPagination.currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {selectedStudentDetails.length > 0 && (
              <div className="border rounded-md p-2">
                <p className="text-sm font-medium mb-2">Selected Students:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudentDetails.map((student) => {
                    if (!student) return null;
                    return (
                      <Badge key={student.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        {student?.email}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            setSelectedStudentDetails(selectedStudentDetails.filter(s => s.id !== student.id));
                          }}
                          title="Remove student"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignStudentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStudentAssignment} disabled={loading.students}>
              {loading.students ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              {selectedTask?.title && selectedStudentForTask?.name
                ? `Subtasks for "${selectedTask.title}" assigned to ${selectedStudentForTask.name}`
                : 'Task details'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {loading.subtasks ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : studentSubtasks.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                No subtasks found for this task and student.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground mb-2 bg-blue-50 p-2 rounded-md">
                  <span className="font-medium">Note:</span> Locking a subtask prevents students from updating its status.
                </div>

                {studentSubtasks.map((subtask) => (
                  <div key={subtask._id} className="border rounded-md p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="font-medium flex items-center">
                        {subtask.title}
                        {subtask.isLocked && (
                          <span className="ml-2 text-blue-700" title="This subtask is locked">🔒</span>
                        )}
                      </div>
                      <Badge variant={subtask.priority.toLowerCase()}>{subtask.priority}</Badge>
                    </div>

                    {subtask.description && (
                      <div className="text-sm text-muted-foreground mt-1">{subtask.description}</div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm">
                        Status:
                        <Badge
                          variant={
                            subtask.status === 'COMPLETED' ? 'success'
                              : subtask.status === 'IN_PROGRESS' ? 'warning'
                                : 'secondary'
                          }
                          className="ml-2"
                        >
                          {subtask.status.replace('_', ' ')}
                        </Badge>
                        {subtask.isLocked && (
                          <Badge variant="outline" className="ml-1">🔒 Locked</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={subtask.status}
                          onValueChange={(value) => handleUpdateSubtaskStatus(subtask.assignmentId, value, subtask.isLocked)}
                          disabled={subtask.isLocked}
                        >
                          <SelectTrigger className={`w-[140px] ${subtask.isLocked ? 'opacity-70' : ''}`}>
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant={subtask.isLocked ? 'secondary' : 'outline'}
                          size="sm"
                          className={`gap-1 ${subtask.isLocked ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : ''}`}
                          onClick={() => handleUpdateSubtaskStatus(subtask.assignmentId, subtask.status, !subtask.isLocked)}
                          title={subtask.isLocked ? 'Unlock subtask' : 'Lock subtask'}
                        >
                          {subtask.isLocked ? '🔓 Unlock' : '🔒 Lock'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={isCategoryManageOpen} onOpenChange={setIsCategoryManageOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {categoryToEdit ? `Edit details for "${categoryToEdit.name}" category` : 'Create a new task category'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="categoryName" className="text-sm font-medium">Category Name</label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label htmlFor="categoryDescription" className="text-sm font-medium">Description (optional)</label>
              <Input
                id="categoryDescription"
                placeholder="Enter category description"
                value={newCategoryData.description}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
              />
            </div>

            {mainTaskCategories.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Current Categories:</p>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
                  <ul className="space-y-2">
                    {mainTaskCategories.map((category) => (
                      <li key={category._id} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                        <span>{category.name}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenCategoryManage(category)}
                            className="h-7 w-7 p-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the "${category.name}" category? This action cannot be undone.`)) {
                                handleDeleteCategory(category._id);
                              }
                            }}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryManageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={loading.categories || !newCategoryData.name.trim()}>
              {loading.categories ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewTask && <TaskPopup task={viewTask} onClose={() => setViewTask(null)} />}

      <DocumentsPopup
        open={isAddDocumentOpen}
        onOpenChange={setIsAddDocumentOpen}
        students={students}
        teamMembers={teamMembers}
        fetchStudents={fetchStudents}
        studentSearch={studentSearch}
        setStudentSearch={setStudentSearch}
        studentPagination={studentPagination}
        loading={loading}
        hasEditPermission={hasEditPermission}
        onDocumentAdded={() => fetchDocuments(currentDocumentPage, debouncedDocSearch)}
      />
    </div>
  );
};

export default Tasks;
