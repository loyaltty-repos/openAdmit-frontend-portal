import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  Badge
} from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { getUser } from '@/lib/auth';
import {
  FilePen,
  GraduationCap,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  Lock,
  Unlock,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { getStudentById, apiService } from '@/services/api.services';
import { getTasksByStudentId } from '@/services/taskService';
import { getSubtasksByTaskAndStudent } from '@/services/subtaskService';
import { getTaskSubtaskQuestionDetails } from '@/services/questionnaireService';
import PropTypes from 'prop-types';
import { AssignUniversityDialog } from './AssignUniversityDialog';
import '@/index.css'; // For spinner styling
import { useNavigate } from 'react-router-dom';

export function StudentProfile({ id }) {
  // Initialize student state with default values for nested objects
  const [student, setStudent] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    status: 'PENDING',
    profilePicture: '',
    programDetails: {
      program: '',
      validity: ''
    },
    personalDetails: {
      dob: '',
      gender: '',
      address: '',
      profession: ''
    },
    collegeDetails: {
      branch: '',
      highestDegree: '',
      university: '',
      college: '',
      gpa: 0,
      toppersGPA: 0,
      noOfBacklogs: 0
    },
    greDetails: {
      greScore: {
        verbal: 0,
        quant: 0,
        awa: 0
      }
    },
    ieltsDetails: {
      ieltsScore: {
        reading: 0,
        writing: 0,
        speaking: 0,
        listening: 0
      }
    },
    toeflDetails: {
      toeflScore: {
        reading: 0,
        writing: 0,
        speaking: 0
      }
    },
    visa: {}
  });

  // Function to check if the current user has edit permissions
  const hasEditPermission = () => {
    const currentUser = getUser();
    // Return true if user is ADMIN or EDITOR, false for VIEWER
    return currentUser && currentUser.role !== 'VIEWER';
  };

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [studentTasks, setStudentTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [subtasks, setSubtasks] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showSubtasksDialog, setShowSubtasksDialog] = useState(false);
  const [questionnaires, setQuestionnaires] = useState({});
  const [questionnaireLoading, setQuestionnaireLoading] = useState(false);
  const [expandedQuestionnaire, setExpandedQuestionnaire] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    status: '',
    profilePicture: '',
    programDetails: {
      program: '',
      validity: ''
    },
    personalDetails: {
      dob: '',
      gender: '',
      address: '',
      profession: ''
    },
    collegeDetails: {
      branch: '',
      highestDegree: '',
      university: '',
      college: '',
      gpa: 0,
      toppersGPA: 0,
      noOfBacklogs: 0,
      admissionTerm: '',
      coursesApplying: []
    },
    greDetails: {
      grePlane: '',
      greDate: '',
      greScoreCard: '',
      greScore: {
        verbal: 0,
        quant: 0,
        awa: 0
      },
      retakingGRE: ''
    },
    ieltsDetails: {
      ieltsPlan: '',
      ieltsDate: '',
      ieltsScore: {
        reading: 0,
        writing: 0,
        speaking: 0,
        listening: 0
      },
      retakingIELTS: ''
    },
    toeflDetails: {
      toeflPlan: '',
      toeflDate: '',
      toeflScore: {
        reading: 0,
        writing: 0,
        speaking: 0
      },
      retakingTOEFL: ''
    },
    visa: {
      countriesPlanningToApply: [],
      visaInterviewDate: '',
      visaInterviewLocation: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universityCurrentPage, setUniversityCurrentPage] = useState(1);
  const [universityPaginationData, setUniversityPaginationData] = useState({});

  const [documentCurrentPage, setDocumnetCurrentPage] = useState(1)
  const [documentPagination, setDocumentPagination] = useState({})

  const fetchAssignments = async ({ studentId } = {}) => {
    try {
      const response = await apiService.get(`/admin/student-university-assignments?page=${universityCurrentPage}&studentId=${studentId}`);
      if (response.data?.assignments) {
        setAssignments(response.data.assignments);
        setUniversityPaginationData(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get student data and assignments in parallel
        const [studentResponse, assignmentsResponse] = await Promise.all([
          getStudentById(id),
          apiService.get(`/admin/student-university-assignments?page=${universityCurrentPage}&studentId=${id}`)
        ]);

        // Check if student data exists
        if (!studentResponse?.data?.student) {
          throw new Error('Student data not found');
        }

        // Merge the API response with default values to ensure all nested objects exist
        const studentData = studentResponse.data.student;
        setStudent(prevState => ({
          ...prevState,
          ...studentData,
          // Ensure nested objects exist
          programDetails: {
            ...prevState.programDetails,
            ...(studentData.programDetails || {})
          },
          personalDetails: {
            ...prevState.personalDetails,
            ...(studentData.personalDetails || {})
          },
          collegeDetails: {
            ...prevState.collegeDetails,
            ...(studentData.collegeDetails || {})
          },
          greDetails: {
            ...prevState.greDetails,
            ...(studentData.greDetails || {}),
            greScore: {
              ...prevState.greDetails.greScore,
              ...(studentData.greDetails?.greScore || {})
            }
          },
          ieltsDetails: {
            ...prevState.ieltsDetails,
            ...(studentData.ieltsDetails || {}),
            ieltsScore: {
              ...prevState.ieltsDetails.ieltsScore,
              ...(studentData.ieltsDetails?.ieltsScore || {})
            }
          },
          toeflDetails: {
            ...prevState.toeflDetails,
            ...(studentData.toeflDetails || {}),
            toeflScore: {
              ...prevState.toeflDetails.toeflScore,
              ...(studentData.toeflDetails?.toeflScore || {})
            }
          },
          visa: {
            ...prevState.visa,
            ...(studentData.visa || {})
          }
        }));
        if (assignmentsResponse?.data?.assignments) {
          setAssignments(assignmentsResponse.data.assignments);
          setUniversityPaginationData(assignmentsResponse?.data.pagination);
          // setUniversityCurrentPage(assignmentsResponse.data.pagination.page)
        }

        // Fetch tasks and subtasks (including questionnaires)
        await fetchStudentTasks(id);
        // Fetch task-subtask-question details
        // await fetchQuestionnaireDetails(id);
        // Fetch student documents
        await fetchStudentDocuments(id);
      } catch (error) {
        console.error('Error fetching data:', error);

        // Get a specific error message
        let errorMessage = 'Failed to load student profile';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    fetchAssignments({ studentId: id });
  }, [universityCurrentPage])

  useEffect(() => {
    fetchStudentDocuments(id)
  }, [documentCurrentPage])

  const fetchStudentTasks = async (studentId) => {
    try {
      setTasksLoading(true);

      const taskResponse = await getTasksByStudentId({ studentId });

      if (taskResponse.success && taskResponse.data.task) {
        const tasks = taskResponse.data.task || [];
        setStudentTasks(tasks);
      }
    } catch (error) {
      console.error('Error fetching student tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setTasksLoading(false);
    }
  };


  const fetchSubtasks = async (taskId, studentId) => {
    try {
      setSubtasksLoading(true);

      if (!taskId || !studentId) {
        console.error('Missing required parameters: taskId or studentId');
        toast.error('Missing required parameters for fetching subtasks');
        return [];
      }

      const response = await getSubtasksByTaskAndStudent(taskId, studentId);

      if (response && response.subTasks) {

        setSubtasks(prev => ({
          ...prev,
          [taskId]: response.subTasks || []
        }));
        return response.subTasks;
      }
      return [];
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      toast.error('Failed to fetch subtasks: ' + (error.response?.data?.message || error.message));
      return [];
    } finally {
      setSubtasksLoading(false);
    }
  };


  const fetchQuestionnaireDetails = async (studentId) => {
    try {
      setQuestionnaireLoading(true);
      const response = await getTaskSubtaskQuestionDetails({ studentId, limit: 50 });

      if (response && response.success) {

        if (response.questionnaireMap) {
          setQuestionnaires(response.questionnaireMap);


          if (selectedTaskId && subtasks[selectedTaskId]) {
            const updatedSubtasks = [...subtasks[selectedTaskId]].map(subtask => {

              const possibleKeys = [
                subtask._id,
                subtask.assignmentId,
                typeof subtask.subtaskId === 'object' ? subtask.subtaskId._id : null,
                typeof subtask.subtaskId === 'string' ? subtask.subtaskId : null
              ].filter(Boolean);


              for (const key of possibleKeys) {
                if (response.questionnaireMap[key] && response.questionnaireMap[key].length > 0) {

                  return {
                    ...subtask,
                    questionnaires: response.questionnaireMap[key]
                  };
                }
              }

              return subtask;
            });


            setSubtasks(prev => ({
              ...prev,
              [selectedTaskId]: updatedSubtasks
            }));
          }

          return;
        }


        const questionnairesBySubtask = {};


        if (response.student && response.student.tasks) {

          response.student.tasks.forEach(taskData => {
            if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
              taskData.subtasks.forEach(subtask => {

                const possibleKeys = new Set();


                if (subtask._id) {
                  possibleKeys.add(subtask._id);
                  questionnairesBySubtask[subtask._id] = subtask.questionnaires || [];
                }

                if (subtask.assignmentId) {
                  possibleKeys.add(subtask.assignmentId);
                  questionnairesBySubtask[subtask.assignmentId] = subtask.questionnaires || [];
                }


                if (typeof subtask.subtaskId === 'object' && subtask.subtaskId?._id) {
                  possibleKeys.add(subtask.subtaskId._id);
                  questionnairesBySubtask[subtask.subtaskId._id] = subtask.questionnaires || [];
                } else if (typeof subtask.subtaskId === 'string') {
                  possibleKeys.add(subtask.subtaskId);
                  questionnairesBySubtask[subtask.subtaskId] = subtask.questionnaires || [];
                }
              });
            }
          });
        }

        setQuestionnaires(questionnairesBySubtask);
      } else {
        console.warn('API response unsuccessful or missing data:', response);
      }
    } catch (error) {
      console.error('Error fetching questionnaire details:', error);
      toast.error('Failed to fetch questionnaire details: ' + (error.response?.data?.message || error.message));
    } finally {
      setQuestionnaireLoading(false);
    }
  };


  const fetchStudentDocuments = async (studentId) => {
    try {
      setDocumentsLoading(true);

      const response = await apiService.get(`/admin/documents/student/${studentId}?page=${documentCurrentPage}&limit=10`);

      if (response && response.success) {
        setDocuments(response.data.documents || []);
        setDocumentPagination(response.data.pagination || {})
      } else {
        console.warn('API response unsuccessful or missing data:', response);
        toast.error('Failed to fetch documents data');
      }
    } catch (error) {
      console.error('Error fetching student documents:', error);
      toast.error('Failed to fetch documents: ' + (error.response?.data?.message || error.message));
    } finally {
      setDocumentsLoading(false);
    }
  };


  const handleUpdateSubtaskStatus = async (subtaskId, status, isLocked) => {
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to update subtask status');
      return;
    }

    try {
      await apiService.put(`/admin/task-subtask-assignments/update`, {
        assignmentId: subtaskId,
        status,
        isLocked,
        dueDate: subtasks[selectedTaskId]?.find(st => st._id === subtaskId)?.dueDate || null
      });
      toast.success('Subtask status updated successfully');

      if (selectedTaskId) {
        await fetchSubtasks(selectedTaskId, id);
      }
    } catch (error) {
      console.error('Error updating subtask status:', error);
      toast.error('Failed to update subtask status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateSubtaskDueDate = async (subtaskId, dueDate) => {
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to update subtask due date');
      return;
    }

    try {
      const subtask = subtasks[selectedTaskId]?.find(st => st._id === subtaskId);
      if (!subtask) {
        throw new Error('Subtask not found');
      }

      await apiService.put(`/admin/task-subtask-assignments/update`, {
        assignmentId: subtaskId,
        status: subtask.status,
        isLocked: subtask.isLocked,
        dueDate
      });
      toast.success('Subtask due date updated successfully');

      if (selectedTaskId) {
        await fetchSubtasks(selectedTaskId, id);
      }
    } catch (error) {
      console.error('Error updating subtask due date:', error);
      toast.error('Failed to update subtask due date: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAssign = async () => {
    // await fetchAssignments();
    await fetchAssignments({ studentId: id });
  };

  const handleUpdateAssignment = async (assignmentId, updates) => {
    // Check if user has edit permissions
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to update university assignments');
      return;
    }

    try {
      await apiService.put(`/admin/student-university-assignments/${assignmentId}`, updates);
      await fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    // Check if user has edit permissions
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to delete university assignments');
      return;
    }

    try {
      await apiService.delete(`/admin/student-university-assignments/${assignmentId}`);
      // await fetchAssignments();
      await fetchAssignments({ studentId: id });
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };


  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      setTasksLoading(true);

      const task = studentTasks.find(t => t._id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }


      await apiService.put(`/admin/student-task-assignments/update`, {
        assignmentId: taskId,
        status,
        isLocked: task.isLocked,
        dueDate: task.dueDate
      });
      toast.success('Task status updated successfully');

      await fetchStudentTasks(id);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status: ' + (error.response?.data?.message || error.message));
    } finally {
      setTasksLoading(false);
    }
  };

  const handleUpdateTaskDueDate = async (taskId, dueDate) => {
    try {
      setTasksLoading(true);

      const task = studentTasks.find(t => t._id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      await apiService.put(`/admin/student-task-assignments/update`, {
        assignmentId: taskId,
        status: task.status,
        isLocked: task.isLocked,
        dueDate
      });
      toast.success('Task due date updated successfully');

      await fetchStudentTasks(id);
    } catch (error) {
      console.error('Error updating task due date:', error);
      toast.error('Failed to update task due date: ' + (error.response?.data?.message || error.message));
    } finally {
      setTasksLoading(false);
    }
  };

  const handleOpenSubtasks = async (taskId) => {

    const task = studentTasks.find(t => t._id === taskId);
    if (!task || !task.taskId?._id) {
      toast.error('Task information not found');
      return;
    }

    const mainTaskId = task.taskId._id;
    setSelectedTaskId(mainTaskId);
    setShowSubtasksDialog(true);


    setSubtasksLoading(true);
    try {
      const subtasksResult = await fetchSubtasks(mainTaskId, id);


      await fetchQuestionnaireDetails(id);


      if (subtasksResult && subtasksResult.length > 0) {
        subtasksResult.forEach((subtask) => {

          if (subtask.questionnaires && subtask.questionnaires.length > 0) {
            return;
          }


          const possibleKeys = [
            subtask?._id,
            subtask?.assignmentId,
            typeof subtask?.subtaskId === 'object' ? subtask.subtaskId._id : null,
            typeof subtask?.subtaskId === 'string' ? subtask.subtaskId : null,
            typeof subtask?._id === 'string' ? subtask._id.replace(/^[a-f0-9]{24}-/, '') : null,
            subtask?.subtaskId?._id || null
          ].filter(Boolean);


          const matchingKeys = possibleKeys.filter(key => questionnaires[key] && questionnaires[key].length > 0);

          if (matchingKeys.length > 0) {

            const key = matchingKeys[0];
            subtask.questionnaires = questionnaires[key];
          }
        });
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      toast.error('Failed to fetch subtasks: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubtasksLoading(false);
    }
  };


  const handleCloseSubtasks = () => {
    setShowSubtasksDialog(false);
  };

  const handleEditStudent = async () => {
    if (!student || !student._id) {
      toast.error('Student information not found');
      return;
    }

    setIsSubmitting(true);
    try {

      const cleanedFormData = { ...editFormData };


      const formatDateForSubmission = (dateString) => {
        if (!dateString) return null;
        try {

          const date = new Date(dateString);
          return date.toISOString();
        } catch (err) {
          console.error('Error formatting date for submission:', err, dateString);
          return null;
        }
      };


      if (cleanedFormData.personalDetails?.dob) {
        cleanedFormData.personalDetails.dob = formatDateForSubmission(cleanedFormData.personalDetails.dob);
      }

      if (cleanedFormData.programDetails?.validity) {
        cleanedFormData.programDetails.validity = formatDateForSubmission(cleanedFormData.programDetails.validity);
      }

      if (cleanedFormData.greDetails?.greDate) {
        cleanedFormData.greDetails.greDate = formatDateForSubmission(cleanedFormData.greDetails.greDate);
      }


      if (cleanedFormData.ieltsDetails?.ieltsDate) {
        cleanedFormData.ieltsDetails.ieltsDate = formatDateForSubmission(cleanedFormData.ieltsDetails.ieltsDate);
      }


      if (cleanedFormData.toeflDetails?.toeflDate) {
        cleanedFormData.toeflDetails.toeflDate = formatDateForSubmission(cleanedFormData.toeflDetails.toeflDate);
      }

      if (cleanedFormData.visa?.visaInterviewDate) {
        cleanedFormData.visa.visaInterviewDate = formatDateForSubmission(cleanedFormData.visa.visaInterviewDate);
      }

      if (cleanedFormData.collegeDetails) {
        cleanedFormData.collegeDetails.gpa = parseFloat(cleanedFormData.collegeDetails.gpa) || 0;
        cleanedFormData.collegeDetails.toppersGPA = parseFloat(cleanedFormData.collegeDetails.toppersGPA) || 0;
        cleanedFormData.collegeDetails.noOfBacklogs = parseInt(cleanedFormData.collegeDetails.noOfBacklogs) || 0;
      }

      if (cleanedFormData.greDetails?.greScore) {
        cleanedFormData.greDetails.greScore.verbal = parseInt(cleanedFormData.greDetails.greScore.verbal) || 0;
        cleanedFormData.greDetails.greScore.quant = parseInt(cleanedFormData.greDetails.greScore.quant) || 0;
        cleanedFormData.greDetails.greScore.awa = parseFloat(cleanedFormData.greDetails.greScore.awa) || 0;
      }

      if (cleanedFormData.ieltsDetails?.ieltsScore) {
        cleanedFormData.ieltsDetails.ieltsScore.reading = parseFloat(cleanedFormData.ieltsDetails.ieltsScore.reading) || 0;
        cleanedFormData.ieltsDetails.ieltsScore.writing = parseFloat(cleanedFormData.ieltsDetails.ieltsScore.writing) || 0;
        cleanedFormData.ieltsDetails.ieltsScore.speaking = parseFloat(cleanedFormData.ieltsDetails.ieltsScore.speaking) || 0;
        cleanedFormData.ieltsDetails.ieltsScore.listening = parseFloat(cleanedFormData.ieltsDetails.ieltsScore.listening) || 0;
      }

      if (cleanedFormData.toeflDetails?.toeflScore) {
        cleanedFormData.toeflDetails.toeflScore.reading = parseInt(cleanedFormData.toeflDetails.toeflScore.reading) || 0;
        cleanedFormData.toeflDetails.toeflScore.writing = parseInt(cleanedFormData.toeflDetails.toeflScore.writing) || 0;
        cleanedFormData.toeflDetails.toeflScore.speaking = parseInt(cleanedFormData.toeflDetails.toeflScore.speaking) || 0;
      }

      console.log('Sending update request for student:', student._id);
      const response = await apiService.put(`/admin/students/${student._id}`, cleanedFormData);
      console.log('Response received:', response);


      if ((response && (response.success === true || response.data?.success === true))) {
        toast.success('Student information updated successfully');


        const updatedStudent = response.data?.student || response.data?.data?.student;
        if (updatedStudent && Object.keys(updatedStudent).length > 0) {
          setStudent(updatedStudent);
        } else {

          setStudent(prev => ({
            ...prev,
            ...cleanedFormData
          }));
        }

        setShowEditDialog(false);
      } else {

        const errorMsg =
          response?.message ||
          response?.data?.message ||
          response?.error?.message ||
          'Failed to update student information. Please try again.';

        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error updating student:', error);


      let errorMessage = 'Failed to update student information';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }


      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');

        if (validationErrors) {
          errorMessage += `. Validation errors: ${validationErrors}`;
        }
      }


      if (errorMessage.includes('enum')) {
        errorMessage += '. Please check dropdown values - they must match the server\'s expected values exactly.';
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    if (student && showEditDialog) {

      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {

          return new Date(dateString).toISOString().split('T')[0];
        } catch (err) {
          console.error('Error formatting date:', err);
          return '';
        }
      };

      setEditFormData({
        name: student.name || '',
        email: student.email || '',
        phoneNumber: student.phoneNumber || '',
        status: student.status || 'PENDING',
        profilePicture: student.profilePicture || '',
        programDetails: {
          program: student.programDetails?.program || '',
          validity: student.programDetails?.validity ? formatDateForInput(student.programDetails.validity) : ''
        },
        personalDetails: {
          dob: student.personalDetails?.dob ? formatDateForInput(student.personalDetails.dob) : '',
          gender: student.personalDetails?.gender || '',
          address: student.personalDetails?.address || '',
          profession: student.personalDetails?.profession || ''
        },
        collegeDetails: {
          branch: student.collegeDetails?.branch || '',
          highestDegree: student.collegeDetails?.highestDegree || '',
          university: student.collegeDetails?.university || '',
          college: student.collegeDetails?.college || '',
          gpa: student.collegeDetails?.gpa || 0,
          toppersGPA: student.collegeDetails?.toppersGPA || 0,
          noOfBacklogs: student.collegeDetails?.noOfBacklogs || 0,
          admissionTerm: student.collegeDetails?.admissionTerm || '',
          coursesApplying: student.collegeDetails?.coursesApplying || []
        },
        greDetails: {
          grePlane: student.greDetails?.grePlane || '',
          greDate: student.greDetails?.greDate ? formatDateForInput(student.greDetails.greDate) : '',
          greScoreCard: student.greDetails?.greScoreCard || '',
          greScore: {
            verbal: student.greDetails?.greScore?.verbal || 0,
            quant: student.greDetails?.greScore?.quant || 0,
            awa: student.greDetails?.greScore?.awa || 0
          },
          retakingGRE: student.greDetails?.retakingGRE || ''
        },
        ieltsDetails: {
          ieltsPlan: student.ieltsDetails?.ieltsPlan || '',
          ieltsDate: student.ieltsDetails?.ieltsDate ? formatDateForInput(student.ieltsDetails.ieltsDate) : '',
          ieltsScore: {
            reading: student.ieltsDetails?.ieltsScore?.reading || 0,
            writing: student.ieltsDetails?.ieltsScore?.writing || 0,
            speaking: student.ieltsDetails?.ieltsScore?.speaking || 0,
            listening: student.ieltsDetails?.ieltsScore?.listening || 0
          },
          retakingIELTS: student.ieltsDetails?.retakingIELTS || ''
        },
        toeflDetails: {
          toeflPlan: student.toeflDetails?.toeflPlan || '',
          toeflDate: student.toeflDetails?.toeflDate ? formatDateForInput(student.toeflDetails.toeflDate) : '',
          toeflScore: {
            reading: student.toeflDetails?.toeflScore?.reading || 0,
            writing: student.toeflDetails?.toeflScore?.writing || 0,
            speaking: student.toeflDetails?.toeflScore?.speaking || 0
          },
          retakingTOEFL: student.toeflDetails?.retakingTOEFL || ''
        },
        visa: {
          countriesPlanningToApply: student.visa?.countriesPlanningToApply || [],
          visaInterviewDate: student.visa?.visaInterviewDate ? formatDateForInput(student.visa.visaInterviewDate) : '',
          visaInterviewLocation: student.visa?.visaInterviewLocation || ''
        }
      });
    }
  }, [student, showEditDialog]);

  const statusClasses = {
    PENDING: 'status-pending',
    ACTIVE: 'status-active',
    COMPLETE: 'status-complete',
    REJECTED: 'status-rejected',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-lg">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student profile you are looking for could not be found. Please check the ID and try again.</p>
          <a href="/admin/students" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Return to Students List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-1/3">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <CardTitle>{student.name || 'Unnamed Student'}</CardTitle>
                <CardDescription>Student ID: {student._id}</CardDescription>
              </div>
              <Badge className={cn('status-pill', statusClasses[student.status])}>
                {student.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent >
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={student.profilePicture} />
                <AvatarFallback className="text-xl">
                  {student.name ? student.name.split(' ').map(n => n[0]).join('') : 'S'}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 mb-4">
                <h2 className="text-xl font-semibold">{student.name || 'Unnamed Student'}</h2>
                <p className="text-sm text-muted-foreground">{student.programDetails?.program || 'No Program'}</p>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{student.email || 'No email'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{student.phoneNumber || 'No phone number'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{student.collegeDetails?.university || 'No university'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <Button onClick={() => navigate(`/admin/messages?studentId=${student._id}`)} className="flex-1" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowEditDialog(true)}
                disabled={!hasEditPermission()}
                title={!hasEditPermission() ? 'You don\'t have permission to edit' : 'Edit student information'}
              >
                <FilePen className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="overview">
            <div className="w-full flex flex-wrap items-center justify-between mb-4">
              <TabsList className='max-w-full  overflow-x-auto justify-start mb-2 '>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="universities">Universities</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              {/* university assigment button */}
              {/* {student && hasEditPermission() && <AssignUniversityDialog  studentId={student._id} onAssign={handleAssign} />} */}
            </div>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Test Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 ">
                    <div>
                      <h3 className="text-sm font-medium mb-2">GRE</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-xs text-muted-foreground">Verbal</p>
                          <p className="text-xl font-semibold">{student.greDetails?.greScore?.verbal ?? 'N/A'}</p>
                        </div>
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-xs text-muted-foreground">Quantitative</p>
                          <p className="text-xl font-semibold">{student.greDetails?.greScore?.quant ?? 'N/A'}</p>
                        </div>
                        <div className="bg-muted rounded-md p-3">
                          <p className="text-xs text-muted-foreground">AWA</p>
                          <p className="text-xl font-semibold">{student.greDetails?.greScore?.awa ?? 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">IELTS</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-muted rounded-md p-3">
                            <p className="text-xs text-muted-foreground">Reading</p>
                            <p className="text-xl font-semibold">{student.ieltsDetails?.ieltsScore?.reading ?? 'N/A'}</p>
                          </div>
                          <div className="bg-muted rounded-md p-3">
                            <p className="text-xs text-muted-foreground">Writing</p>
                            <p className="text-xl font-semibold">{student.ieltsDetails?.ieltsScore?.writing ?? 'N/A'}</p>
                          </div>
                          <div className="bg-muted rounded-md p-3">
                            <p className="text-xs text-muted-foreground">Speaking</p>
                            <p className="text-xl font-semibold">{student.ieltsDetails?.ieltsScore?.speaking ?? 'N/A'}</p>
                          </div>
                          <div className="bg-muted rounded-md p-3">
                            <p className="text-xs text-muted-foreground">Listening</p>
                            <p className="text-xl font-semibold">{student.ieltsDetails?.ieltsScore?.listening ?? 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">TOEFL</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-muted rounded-md p-3">
                            <p className="text-xs text-muted-foreground">Reading</p>
                            <p className="text-xl font-semibold">{student.toeflDetails?.toeflScore?.reading ?? 'N/A'}</p>
                          </div>
                          <div className="bg-muted rounded-md p-3">
                            <p className="text-xs text-muted-foreground">Writing</p>
                            <p className="text-xl font-semibold">{student.toeflDetails?.toeflScore?.writing ?? 'N/A'}</p>
                          </div>
                          <div className="bg-muted rounded-md p-3">
                            <p className="text-xs text-muted-foreground">Speaking</p>
                            <p className="text-xl font-semibold">{student.toeflDetails?.toeflScore?.speaking ?? 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Degree</p>
                        <p className="text-xl font-semibold">{student.collegeDetails?.highestDegree ?? 'N/A'}</p>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Branch</p>
                        <p className="text-xl font-semibold">{student.collegeDetails?.branch ?? 'N/A'}</p>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">GPA</p>
                        <p className="text-xl font-semibold">{student.collegeDetails?.gpa ?? 'N/A'}</p>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Toppers GPA</p>
                        <p className="text-xl font-semibold">{student.collegeDetails?.toppersGPA ?? 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Document Checklist</CardTitle>
                  <CardDescription>
                    Track the status of required documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documentsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No documents found for this student.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {documents.map((docGroup, index) => (
                        <div key={index} className="border rounded-md overflow-hidden">
                          <div className="bg-muted p-3">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                              <div>
                                <h3 className="font-medium">{docGroup.task?.title || 'Untitled Task'}</h3>
                                <p className="text-xs text-muted-foreground">
                                  Task ID: {docGroup.task?._id || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {docGroup.subtasks && docGroup.subtasks.length > 0 ? (
                            <div className="p-3">
                              <h4 className="text-sm font-medium mb-2">Associated Subtasks:</h4>
                              <div className="space-y-2">
                                {docGroup.subtasks.map((subtask, idx) => (
                                  <div key={idx} className="pl-4 border-l-2 border-muted">
                                    <p className="text-sm">{subtask.title || 'Untitled Subtask'}</p>
                                    {subtask.documents && subtask.documents.length > 0 ? (
                                      <div className="mt-2 space-y-2">
                                        {subtask.documents.map((doc, docIdx) => (
                                          <div key={docIdx} className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></div>
                                            <p className="text-xs">{doc.name || doc.fileName || 'Unnamed Document'}</p>
                                            <Badge className="ml-2" variant="outline">
                                              {doc.status || 'Pending'}
                                            </Badge>
                                            {doc.url && (
                                              <Button size="sm" variant="ghost" className="h-6 ml-auto" asChild>
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                  <Eye className="h-3 w-3 mr-1" /> View
                                                </a>
                                              </Button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground mt-1">No documents attached</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3">
                              <p className="text-sm text-muted-foreground">No subtasks or documents associated</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {documentPagination && documentPagination?.totalPages > 1 && (
                    <div className="flex justify-center my-6 gap-2">
                      <Button
                        variant="outline"
                        disabled={documentPagination.page == 1 ? true : false}
                        onClick={() => { setDocumnetCurrentPage(documentPagination.page - 1) }}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2">
                        Page {documentPagination.page} of {documentPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={documentPagination.totalPages == documentPagination.page ? true : false}
                        onClick={() => { setDocumnetCurrentPage(documentPagination.page + 1) }}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="universities">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>University Applications</CardTitle>
                    <CardDescription>
                      Universities the student has applied to
                    </CardDescription>
                  </div>
                  {hasEditPermission() && (
                    <AssignUniversityDialog studentId={student._id} onAssign={handleAssign} />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment._id} className="border rounded-md overflow-hidden">
                        <div className="bg-muted p-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground" />
                            <div>                              <h3 className="font-medium">{assignment.universityId?.name || 'Unknown University'}</h3>
                              <p className="text-sm text-muted-foreground">{assignment.universityId?.program || 'No Program Specified'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn('status-pill', statusClasses[assignment.admissionStatus.toUpperCase()])}>
                              {assignment.admissionStatus}
                            </Badge>
                            <Badge variant="secondary">{assignment.universityStatus}</Badge>
                          </div>
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Assigned By:</span>
                            <span>{assignment.assignedBy.email}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Assigned Date:</span>
                            <span>{new Date(assignment.assignedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Select
                              value={assignment.universityStatus}
                              onValueChange={(value) => handleUpdateAssignment(assignment._id, { universityStatus: value })}
                              disabled={!hasEditPermission()}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ambitious">Ambitious</SelectItem>
                                <SelectItem value="Achievable">Achievable</SelectItem>
                                <SelectItem value="Safe">Safe</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={assignment.admissionStatus}
                              onValueChange={(value) => handleUpdateAssignment(assignment._id, { admissionStatus: value })}
                              disabled={!hasEditPermission()}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Applied">Applied</SelectItem>
                                <SelectItem value="Accepted">Accepted</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment._id)}
                              disabled={!hasEditPermission()}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No universities assigned yet
                      </div>
                    )}
                  </div>

                  {universityPaginationData && universityPaginationData?.totalPages > 1 && (
                    <div className="flex justify-center my-6 gap-2">
                      <Button
                        variant="outline"
                        disabled={universityPaginationData.page == 1 ? true : false}
                        onClick={() => { setUniversityCurrentPage(universityPaginationData.page - 1) }}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2">
                        Page {universityPaginationData.page} of {universityPaginationData.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={universityPaginationData.totalPages == universityPaginationData.page ? true : false}
                        onClick={() => { setUniversityCurrentPage(universityPaginationData.page + 1) }}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks & Progress</CardTitle>
                  <CardDescription>Track student progress through assigned tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="spinner"></div>
                    </div>
                  ) : studentTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No tasks assigned to this student yet.</p>
                      <Button variant="outline" className="mt-4">
                        Assign Task
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {studentTasks.map(task => (
                        <AccordionItem key={task._id} value={task._id}>
                          <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center">
                                <div className="mr-4">
                                  <Badge className={`status-pill ${statusClasses[task.status]}`}>
                                    {task.status}
                                  </Badge>
                                </div>
                                <div>
                                  <h3 className="font-medium text-left">{task.taskId?.title || 'Untitled Task'}</h3>
                                  <p className="text-xs text-muted-foreground text-left">
                                    {task.taskId?.description ?
                                      task.taskId.description.substring(0, 60) + (task.taskId.description.length > 60 ? '...' : '')
                                      : 'No description'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="text-xs text-right mr-4">
                                  <div className="font-medium">Due</div>
                                  <div>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              {hasEditPermission() && (
                                <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/20 rounded-md">
                                  <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Status:</label>
                                    <Select
                                      value={task.status}
                                      onValueChange={(value) => handleUpdateTaskStatus(task._id, value)}
                                    >
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Update Status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Due Date:</label>
                                    <Input
                                      type="date"
                                      value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                      onChange={(e) => handleUpdateTaskDueDate(task._id, e.target.value)}
                                      className="w-[180px]"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Task details */}
                              <div className="bg-muted/30 p-4 rounded-md">
                                <div className="mb-2">
                                  <span className="text-sm font-medium">Description:</span>
                                  <p className="text-sm mt-1">{task.taskId?.description || 'No description provided'}</p>
                                </div>

                                {task.taskId?.category && (
                                  <div className="mb-2">
                                    <span className="text-sm font-medium">Category:</span>
                                    <Badge variant="outline" className="ml-2">{task.taskId.category}</Badge>
                                  </div>
                                )}

                                <div className="mb-2">
                                  <span className="text-sm font-medium">Priority:</span>
                                  <Badge variant="outline" className="ml-2">{task.taskId?.priority || 'MEDIUM'}</Badge>
                                </div>

                                {task.assignedAt && (
                                  <div className="mb-2">
                                    <span className="text-sm font-medium">Assigned:</span>
                                    <span className="text-sm ml-2">{new Date(task.assignedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleOpenSubtasks(task._id)}>
                                  View Subtasks {subtasks[task.taskId?._id] ? `(${subtasks[task.taskId?._id].length})` : ''}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Subtasks Dialog */}
      <Dialog open={showSubtasksDialog} onOpenChange={handleCloseSubtasks}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subtasks & Questionnaires</DialogTitle>
            <DialogDescription>
              Manage subtasks and view associated questionnaires
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {subtasksLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="spinner"></div>
              </div>
            ) : (
              <div>
                {!subtasks[selectedTaskId] || subtasks[selectedTaskId]?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No subtasks found for this task.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subtasks[selectedTaskId]?.map(subtask => (
                      <div key={subtask._id} className="rounded-md border">
                        <div className="p-3 bg-muted flex justify-between items-center">
                          <div className="flex-1">
                            {/* Display the subtask title - it's stored in the subtaskId field which might be a string or an object */}
                            <p className="text-sm font-medium">
                              {typeof subtask.subtaskId === 'string'
                                ? subtask.subtaskId
                                : (subtask.subtaskId?.title || 'Untitled Subtask')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Status:</span> {subtask.status}
                              {subtask.isLocked && <span className="ml-2 text-amber-600">(Locked)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Assigned:</span> {new Date(subtask.assignedAt).toLocaleDateString()}
                            </p>
                            {subtask.dueDate && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Due:</span> {new Date(subtask.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn('status-pill', statusClasses[subtask.status])}>
                              {subtask.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateSubtaskStatus(
                                subtask._id,
                                subtask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
                                !subtask.isLocked
                              )}
                            >
                              {subtask.isLocked ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                              {subtask.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                            </Button>
                          </div>
                        </div>

                        {hasEditPermission() && (
                          <div className="p-3 bg-muted/20 border-t">
                            <div className="flex gap-4 items-end">
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Status:</label>
                                <Select
                                  value={subtask.status}
                                  onValueChange={(value) => handleUpdateSubtaskStatus(subtask._id, value, subtask.isLocked)}
                                >
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Update Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Due Date:</label>
                                <Input
                                  type="date"
                                  value={subtask.dueDate ? new Date(subtask.dueDate).toISOString().split('T')[0] : ''}
                                  onChange={(e) => handleUpdateSubtaskDueDate(subtask._id, e.target.value)}
                                  className="w-[150px]"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Questionnaires for this subtask */}
                        <div className="p-3 border-t">
                          <div className="flex items-center mb-2">
                            <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                            <h4 className="text-sm font-medium">Questionnaires</h4>
                          </div>

                          {questionnaireLoading ? (
                            <div className="flex justify-center py-4">
                              <div className="spinner-sm"></div>
                            </div>
                          ) : (
                            <div>
                              {(() => {

                                if (subtask.questionnaires && Array.isArray(subtask.questionnaires) && subtask.questionnaires.length > 0) {
                                  const foundQuestionnaires = subtask.questionnaires;

                                  return (
                                    <div className="space-y-2">
                                      {foundQuestionnaires.map(questionnaire => (
                                        <div key={questionnaire._id} className="border rounded-sm">
                                          <div
                                            className="p-2 bg-muted/50 flex justify-between items-center cursor-pointer"
                                            onClick={() => setExpandedQuestionnaire(
                                              expandedQuestionnaire === `${subtask._id}-${questionnaire._id}` ? null : `${subtask._id}-${questionnaire._id}`
                                            )}
                                          >
                                            <div className="flex items-center">
                                              {expandedQuestionnaire === `${subtask._id}-${questionnaire._id}` ?
                                                <ChevronDown className="h-4 w-4 mr-1" /> :
                                                <ChevronRight className="h-4 w-4 mr-1" />
                                              }
                                              <span className="text-xs font-medium">{questionnaire.title}</span>
                                            </div>
                                            <div>
                                              <Badge variant="outline" className="text-xs">
                                                {questionnaire.status || 'PENDING'}
                                              </Badge>
                                            </div>
                                          </div>

                                          {expandedQuestionnaire === `${subtask._id}-${questionnaire._id}` && (
                                            <div className="p-2 text-xs space-y-2">
                                              <p className="text-muted-foreground">{questionnaire.description}</p>

                                              {questionnaire.questions && questionnaire.questions.length > 0 ? (
                                                <div className="space-y-2">
                                                  <h5 className="font-medium">Questions:</h5>
                                                  <ol className="list-decimal list-inside space-y-1.5">
                                                    {questionnaire.questions.map(question => (
                                                      <li key={question._id} className="ml-1">
                                                        <div className="text-xs font-medium">{question.question}</div>
                                                        <div className="pl-4 mt-1 text-xs">
                                                          <span className="text-muted-foreground">Type: </span>
                                                          <span>{question.ansType}</span>
                                                          {question.options && question.options.length > 0 && (
                                                            <div className="mt-1">
                                                              <span className="text-muted-foreground">Options: </span>
                                                              <span>{question.options.join(', ')}</span>
                                                            </div>
                                                          )}
                                                        </div>
                                                        {question.answer && (
                                                          <div className="pl-4 mt-1">
                                                            <span className="text-muted-foreground">Answer: </span>
                                                            <span>{question.answer}</span>
                                                          </div>
                                                        )}
                                                      </li>
                                                    ))}
                                                  </ol>
                                                </div>
                                              ) : (
                                                <p className="text-muted-foreground italic">No questions available</p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }

                                // If no direct questionnaires, try looking them up by key
                                // Get a comprehensive list of possible keys for this subtask
                                const possibleKeys = [
                                  subtask._id,
                                  subtask.assignmentId,
                                  // For when subtaskId is an object
                                  typeof subtask.subtaskId === 'object' ? subtask.subtaskId._id : null,
                                  // For when subtaskId is a string
                                  typeof subtask.subtaskId === 'string' ? subtask.subtaskId : null,
                                  // Try without prefixes/suffixes if they exist
                                  subtask._id?.replace(/^[a-f0-9]{24}-/, '') || null,
                                  // Try different combinations that might exist in the data
                                  subtask.subtaskId?._id || null
                                ].filter(Boolean); // Remove null/undefined values

                                // Find the questionnaires by trying each key
                                let foundQuestionnaires = null;

                                for (const key of possibleKeys) {
                                  if (questionnaires[key] && Array.isArray(questionnaires[key]) && questionnaires[key].length > 0) {
                                    foundQuestionnaires = questionnaires[key];
                                    break;
                                  }
                                }

                                if (foundQuestionnaires) {
                                  return (
                                    <div className="space-y-2">
                                      {foundQuestionnaires.map(questionnaire => (
                                        <div key={questionnaire._id} className="border rounded-sm">
                                          <div
                                            className="p-2 bg-muted/50 flex justify-between items-center cursor-pointer"
                                            onClick={() => setExpandedQuestionnaire(
                                              expandedQuestionnaire === `${subtask._id}-${questionnaire._id}` ? null : `${subtask._id}-${questionnaire._id}`
                                            )}
                                          >
                                            <div className="flex items-center">
                                              {expandedQuestionnaire === `${subtask._id}-${questionnaire._id}` ?
                                                <ChevronDown className="h-4 w-4 mr-1" /> :
                                                <ChevronRight className="h-4 w-4 mr-1" />
                                              }
                                              <span className="text-xs font-medium">{questionnaire.title}</span>
                                            </div>
                                            <div>
                                              <Badge variant="outline" className="text-xs">
                                                {questionnaire.status || 'PENDING'}
                                              </Badge>
                                            </div>
                                          </div>

                                          {expandedQuestionnaire === `${subtask._id}-${questionnaire._id}` && (
                                            <div className="p-2 text-xs space-y-2">
                                              <p className="text-muted-foreground">{questionnaire.description}</p>

                                              {questionnaire.questions && questionnaire.questions.length > 0 ? (
                                                <div className="space-y-2">
                                                  <h5 className="font-medium">Questions:</h5>
                                                  <ol className="list-decimal list-inside space-y-1.5">
                                                    {questionnaire.questions.map(question => (
                                                      <li key={question._id} className="ml-1">
                                                        <div className="text-xs font-medium">{question.question}</div>
                                                        <div className="pl-4 mt-1 text-xs">
                                                          <span className="text-muted-foreground">Type: </span>
                                                          <span>{question.ansType}</span>
                                                          {question.options && question.options.length > 0 && (
                                                            <div className="mt-1">
                                                              <span className="text-muted-foreground">Options: </span>
                                                              <span>{question.options.join(', ')}</span>
                                                            </div>
                                                          )}
                                                        </div>
                                                        {question.answer && (
                                                          <div className="pl-4 mt-1">
                                                            <span className="text-muted-foreground">Answer: </span>
                                                            <span>{question.answer}</span>
                                                          </div>
                                                        )}
                                                      </li>
                                                    ))}
                                                  </ol>
                                                </div>
                                              ) : (
                                                <p className="text-muted-foreground italic">No questions available</p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                } else {
                                  return <p className="text-xs text-muted-foreground py-2">No questionnaires associated with this subtask.</p>;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          // Only allow closing the dialog or opening it if user has permission
          if (!open || hasEditPermission()) {
            setShowEditDialog(open);
          } else {
            toast.error('You don\'t have permission to edit student information');
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Make changes to the student&apos;s profile information below.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="program">Program</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="testScores">Test Scores</TabsTrigger>
              <TabsTrigger value="visa">Visa</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="Email Address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  placeholder="Phone Number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture URL</Label>
                <Input
                  id="profilePicture"
                  value={editFormData.profilePicture}
                  onChange={(e) => setEditFormData({ ...editFormData, profilePicture: e.target.value })}
                  placeholder="Profile Picture URL"
                />
              </div>

              <h3 className="text-lg font-medium mt-6 mb-2">Personal Details</h3>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={editFormData.personalDetails.dob || ''}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    personalDetails: {
                      ...editFormData.personalDetails,
                      dob: e.target.value
                    }
                  })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={editFormData.personalDetails.gender}
                  onValueChange={(value) => setEditFormData({
                    ...editFormData,
                    personalDetails: {
                      ...editFormData.personalDetails,
                      gender: value
                    }
                  })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editFormData.personalDetails.address}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    personalDetails: {
                      ...editFormData.personalDetails,
                      address: e.target.value
                    }
                  })}
                  placeholder="Address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={editFormData.personalDetails.profession}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    personalDetails: {
                      ...editFormData.personalDetails,
                      profession: e.target.value
                    }
                  })}
                  placeholder="Profession"
                />
              </div>
            </TabsContent>

            <TabsContent value="program" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={editFormData.programDetails.program}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    programDetails: {
                      ...editFormData.programDetails,
                      program: e.target.value
                    }
                  })}
                  placeholder="Program"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity">Validity</Label>
                <Input
                  id="validity"
                  value={editFormData.programDetails.validity}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    programDetails: {
                      ...editFormData.programDetails,
                      validity: e.target.value
                    }
                  })}
                  placeholder="Validity"
                />
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={editFormData.collegeDetails.branch}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    collegeDetails: {
                      ...editFormData.collegeDetails,
                      branch: e.target.value
                    }
                  })}
                  placeholder="Branch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highestDegree">Highest Degree</Label>
                <Input
                  id="highestDegree"
                  value={editFormData.collegeDetails.highestDegree}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    collegeDetails: {
                      ...editFormData.collegeDetails,
                      highestDegree: e.target.value
                    }
                  })}
                  placeholder="Highest Degree"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={editFormData.collegeDetails.university}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    collegeDetails: {
                      ...editFormData.collegeDetails,
                      university: e.target.value
                    }
                  })}
                  placeholder="University"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={editFormData.collegeDetails.college}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    collegeDetails: {
                      ...editFormData.collegeDetails,
                      college: e.target.value
                    }
                  })}
                  placeholder="College"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    value={editFormData.collegeDetails.gpa}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      collegeDetails: {
                        ...editFormData.collegeDetails,
                        gpa: e.target.value
                      }
                    })}
                    placeholder="GPA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toppersGPA">Topper&apos;s GPA</Label>
                  <Input
                    id="toppersGPA"
                    type="number"
                    step="0.01"
                    value={editFormData.collegeDetails.toppersGPA}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      collegeDetails: {
                        ...editFormData.collegeDetails,
                        toppersGPA: e.target.value
                      }
                    })}
                    placeholder="Topper's GPA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="noOfBacklogs">Number of Backlogs</Label>
                <Input
                  id="noOfBacklogs"
                  type="number"
                  value={editFormData.collegeDetails.noOfBacklogs}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    collegeDetails: {
                      ...editFormData.collegeDetails,
                      noOfBacklogs: e.target.value
                    }
                  })}
                  placeholder="Number of Backlogs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionTerm">Admission Term</Label>
                <Input
                  id="admissionTerm"
                  value={editFormData.collegeDetails.admissionTerm}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    collegeDetails: {
                      ...editFormData.collegeDetails,
                      admissionTerm: e.target.value
                    }
                  })}
                  placeholder="Admission Term"
                />
              </div>
            </TabsContent>


            <TabsContent value="testScores" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="gre">
                  <AccordionTrigger>GRE Details</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="grePlane">GRE Plan</Label>
                      <Input
                        id="grePlane"
                        value={editFormData.greDetails.grePlane}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          greDetails: {
                            ...editFormData.greDetails,
                            grePlane: e.target.value
                          }
                        })}
                        placeholder="GRE Plan"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="greDate">GRE Date</Label>
                      <Input
                        id="greDate"
                        type="date"
                        value={editFormData.greDetails.greDate || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          greDetails: {
                            ...editFormData.greDetails,
                            greDate: e.target.value
                          }
                        })}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="greScoreCard">GRE Score Card</Label>
                      <Input
                        id="greScoreCard"
                        value={editFormData.greDetails.greScoreCard}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          greDetails: {
                            ...editFormData.greDetails,
                            greScoreCard: e.target.value
                          }
                        })}
                        placeholder="GRE Score Card"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="greVerbal">Verbal Score</Label>
                        <Input
                          id="greVerbal"
                          type="number"
                          value={editFormData.greDetails.greScore.verbal}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            greDetails: {
                              ...editFormData.greDetails,
                              greScore: {
                                ...editFormData.greDetails.greScore,
                                verbal: e.target.value
                              }
                            }
                          })}
                          placeholder="Verbal Score"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="greQuant">Quant Score</Label>
                        <Input
                          id="greQuant"
                          type="number"
                          value={editFormData.greDetails.greScore.quant}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            greDetails: {
                              ...editFormData.greDetails,
                              greScore: {
                                ...editFormData.greDetails.greScore,
                                quant: e.target.value
                              }
                            }
                          })}
                          placeholder="Quant Score"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="greAwa">AWA Score</Label>
                        <Input
                          id="greAwa"
                          type="number"
                          step="0.5"
                          value={editFormData.greDetails.greScore.awa}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            greDetails: {
                              ...editFormData.greDetails,
                              greScore: {
                                ...editFormData.greDetails.greScore,
                                awa: e.target.value
                              }
                            }
                          })}
                          placeholder="AWA Score"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retakingGRE">Retaking GRE</Label>
                      <Select
                        value={editFormData.greDetails.retakingGRE}
                        onValueChange={(value) => setEditFormData({
                          ...editFormData,
                          greDetails: {
                            ...editFormData.greDetails,
                            retakingGRE: value
                          }
                        })}
                      >
                        <SelectTrigger id="retakingGRE">
                          <SelectValue placeholder="Retaking GRE?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">Yes</SelectItem>
                          <SelectItem value="NO">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ielts">
                  <AccordionTrigger>IELTS Details</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ieltsPlan">IELTS Plan</Label>
                      <Input
                        id="ieltsPlan"
                        value={editFormData.ieltsDetails.ieltsPlan || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          ieltsDetails: {
                            ...editFormData.ieltsDetails,
                            ieltsPlan: e.target.value
                          }
                        })}
                        placeholder="IELTS Plan"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ieltsDate">IELTS Date</Label>
                      <Input
                        id="ieltsDate"
                        type="date"
                        value={editFormData.ieltsDetails.ieltsDate || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          ieltsDetails: {
                            ...editFormData.ieltsDetails,
                            ieltsDate: e.target.value
                          }
                        })}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ieltsReading">Reading Score</Label>
                        <Input
                          id="ieltsReading"
                          type="number"
                          step="0.5"
                          value={editFormData.ieltsDetails.ieltsScore.reading}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            ieltsDetails: {
                              ...editFormData.ieltsDetails,
                              ieltsScore: {
                                ...editFormData.ieltsDetails.ieltsScore,
                                reading: e.target.value
                              }
                            }
                          })}
                          placeholder="Reading Score"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ieltsWriting">Writing Score</Label>
                        <Input
                          id="ieltsWriting"
                          type="number"
                          step="0.5"
                          value={editFormData.ieltsDetails.ieltsScore.writing}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            ieltsDetails: {
                              ...editFormData.ieltsDetails,
                              ieltsScore: {
                                ...editFormData.ieltsDetails.ieltsScore,
                                writing: e.target.value
                              }
                            }
                          })}
                          placeholder="Writing Score"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ieltsSpeaking">Speaking Score</Label>
                        <Input
                          id="ieltsSpeaking"
                          type="number"
                          step="0.5"
                          value={editFormData.ieltsDetails.ieltsScore.speaking}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            ieltsDetails: {
                              ...editFormData.ieltsDetails,
                              ieltsScore: {
                                ...editFormData.ieltsDetails.ieltsScore,
                                speaking: e.target.value
                              }
                            }
                          })}
                          placeholder="Speaking Score"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ieltsListening">Listening Score</Label>
                        <Input
                          id="ieltsListening"
                          type="number"
                          step="0.5"
                          value={editFormData.ieltsDetails.ieltsScore.listening}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            ieltsDetails: {
                              ...editFormData.ieltsDetails,
                              ieltsScore: {
                                ...editFormData.ieltsDetails.ieltsScore,
                                listening: e.target.value
                              }
                            }
                          })}
                          placeholder="Listening Score"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retakingIELTS">Retaking IELTS</Label>
                      <Select
                        value={editFormData.ieltsDetails.retakingIELTS}
                        onValueChange={(value) => setEditFormData({
                          ...editFormData,
                          ieltsDetails: {
                            ...editFormData.ieltsDetails,
                            retakingIELTS: value
                          }
                        })}
                      >
                        <SelectTrigger id="retakingIELTS">
                          <SelectValue placeholder="Retaking IELTS?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">Yes</SelectItem>
                          <SelectItem value="NO">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="toefl">
                  <AccordionTrigger>TOEFL Details</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="toeflPlan">TOEFL Plan</Label>
                      <Input
                        id="toeflPlan"
                        value={editFormData.toeflDetails.toeflPlan || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          toeflDetails: {
                            ...editFormData.toeflDetails,
                            toeflPlan: e.target.value
                          }
                        })}
                        placeholder="TOEFL Plan"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toeflDate">TOEFL Date</Label>
                      <Input
                        id="toeflDate"
                        type="date"
                        value={editFormData.toeflDetails.toeflDate || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          toeflDetails: {
                            ...editFormData.toeflDetails,
                            toeflDate: e.target.value
                          }
                        })}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="toeflReading">Reading Score</Label>
                        <Input
                          id="toeflReading"
                          type="number"
                          value={editFormData.toeflDetails.toeflScore.reading}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            toeflDetails: {
                              ...editFormData.toeflDetails,
                              toeflScore: {
                                ...editFormData.toeflDetails.toeflScore,
                                reading: e.target.value
                              }
                            }
                          })}
                          placeholder="Reading Score"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="toeflWriting">Writing Score</Label>
                        <Input
                          id="toeflWriting"
                          type="number"
                          value={editFormData.toeflDetails.toeflScore.writing}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            toeflDetails: {
                              ...editFormData.toeflDetails,
                              toeflScore: {
                                ...editFormData.toeflDetails.toeflScore,
                                writing: e.target.value
                              }
                            }
                          })}
                          placeholder="Writing Score"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="toeflSpeaking">Speaking Score</Label>
                        <Input
                          id="toeflSpeaking"
                          type="number"
                          value={editFormData.toeflDetails.toeflScore.speaking}
                          onChange={(e) => setEditFormData({
                            ...editFormData,
                            toeflDetails: {
                              ...editFormData.toeflDetails,
                              toeflScore: {
                                ...editFormData.toeflDetails.toeflScore,
                                speaking: e.target.value
                              }
                            }
                          })}
                          placeholder="Speaking Score"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retakingTOEFL">Retaking TOEFL</Label>
                      <Select
                        value={editFormData.toeflDetails.retakingTOEFL}
                        onValueChange={(value) => setEditFormData({
                          ...editFormData,
                          toeflDetails: {
                            ...editFormData.toeflDetails,
                            retakingTOEFL: value
                          }
                        })}
                      >
                        <SelectTrigger id="retakingTOEFL">
                          <SelectValue placeholder="Retaking TOEFL?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YES">Yes</SelectItem>
                          <SelectItem value="NO">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="visa" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visaInterviewDate">Visa Interview Date</Label>
                <Input
                  id="visaInterviewDate"
                  type="date"
                  value={editFormData.visa.visaInterviewDate || ''}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    visa: {
                      ...editFormData.visa,
                      visaInterviewDate: e.target.value
                    }
                  })}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visaInterviewLocation">Visa Interview Location</Label>
                <Input
                  id="visaInterviewLocation"
                  value={editFormData.visa.visaInterviewLocation}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    visa: {
                      ...editFormData.visa,
                      visaInterviewLocation: e.target.value
                    }
                  })}
                  placeholder="Visa Interview Location"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditStudent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

StudentProfile.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
