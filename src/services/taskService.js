import { apiService } from './api.services';

export const createTask = async (data) => {
  return await apiService.post('/admin/tasks', data);
};

export const getTasks = async ({page , limit= 10 }) => {
  return await apiService.get(`/admin/tasks?page=${page}`);
};

export const getTaskById = async (taskId) => {
  return await apiService.get(`/admin/tasks/${taskId}`);
};

export const updateTask = async (taskId, data) => {
  return await apiService.put(`/admin/tasks/${taskId}`, data);
};

export const deleteTask = async (taskId) => {
  return await apiService.delete(`/admin/tasks/${taskId}`);
};

// Task-Student Assignment
export const addStudentsToTask = async (taskId, data) => {
  return await apiService.post(`/admin/tasks/${taskId}/students/add`, data);
};

export const removeStudentFromTask = async (taskId, data) => {
  return await apiService.post(`/admin/tasks/${taskId}/students/remove`, data);
};

export const updateStudentTaskAssignment = async (data) => {
  return await apiService.put('/admin/student-task-assignments/update', data);
};

// Task-Subtask Assignment
export const addSubtasksToTask = async (taskId, data) => {
  return await apiService.post(`/admin/tasks/${taskId}/subtasks/add`, data);
};

export const removeSubtaskFromTask = async (taskId, data) => {
  return await apiService.post(`/admin/tasks/${taskId}/subtasks/remove`, data);
};

export const updateTaskSubtaskAssignment = async (data) => {
  return await apiService.put('/admin/task-subtask-assignments/update', data);
};

// Create a subtask with a questionnaire and add it to the task
export const addQuestionnaireToTask = async (taskId, questionnaireId) => {
  // 1. Create a subtask for the questionnaire
  const subtaskResponse = await apiService.post('/admin/subtasks', {
    title: 'Questionnaire',
    description: 'Complete the questionnaire',
    priority: 'MEDIUM',
    questionnaireIds: [questionnaireId],
  });

  // 2. Add the subtask to the task
  await addSubtasksToTask(taskId, {
    subtaskIds: [subtaskResponse.data.subtask._id],
  });

  return subtaskResponse;
};

export const getStudentTasks = async ({ sortOrder = 'desc', page = 1, limit = 10 } = {}) => {
  return await apiService.get('/student/tasks', {
    params: { sortOrder, page, limit },
  });
};

export const getTasksByStudentId = async ({studentId , page , search }={}) => {
  if (!studentId) {
    throw new Error('Student ID is required');
  }
  try {
    const response = await apiService.get(`/admin/task/${studentId}`);
    // The API returns { success, message, data: { task: [...] } }
    return {
      success: true,
      data: {
        task: response.data?.task || []
      }
    };
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    throw error;
  }
};


export const createDocument = async (data) => {
  return await apiService.post('/admin/document/upload-document', data);
};

export const getDocuments = async ({ page = 1, limit = 10 } = {}) => {
  return await apiService.get(`/admin/document/upload-document?page=${page}&limit=${limit}`);
};

// services/taskService.js

export const getStudentDocuments = async () => {
  try {
    const response = await apiService.get('/student/document');
    return {
      success: true,
      data: response.data // Expected: { documents: [...] }
    };
  } catch (error) {
    console.error('Error fetching student documents:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch documents'
    };
  }
};

// PUT: Update document status
export const updateDocumentStatus = async (documentId, status) => {
  try {
    const response = await apiService.put(`/student/document/${documentId}`, { status });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating document status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update document status'
    };
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await apiService.delete(`/admin/document/delete-uploaded-document/${documentId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete document'
    };
  }
};

