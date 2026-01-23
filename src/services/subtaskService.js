import { apiService } from './api.services';

export const getSubtasks = async (page = 1, limit = 10 ,searchTerm) => {
  try {
    const response = await apiService.get(`/admin/subtasks?page=${page}&limit=${limit}&search=${searchTerm}`);
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    throw error;
  }
};

export const getSubtaskById = async (subtaskId) => {
  try {
    const response = await apiService.get(`/admin/subtasks/${subtaskId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching subtask:', error);
    throw error;
  }
};

export const createSubtask = async (subtaskData) => {
  try {
    const response = await apiService.post('/admin/subtasks', {
      title: subtaskData.title,
      description: subtaskData.description,
      logo: subtaskData.logo,
      priority: subtaskData.priority,
      questionnaireIds: subtaskData.questionnaireIds || []
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating subtask:', error);
    throw error;
  }
};

export const updateSubtask = async (subtaskId, subtaskData) => {
  try {
    const response = await apiService.put(`/admin/subtasks/${subtaskId}`, {
      title: subtaskData.title,
      description: subtaskData.description,
      logo: subtaskData.logo,
      priority: subtaskData.priority,
      questionnaireIds: subtaskData.questionnaireIds || []
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating subtask:', error);
    throw error;
  }
};

export const deleteSubtask = async (subtaskId) => {
  try {
    const response = await apiService.delete(`/admin/subtasks/${subtaskId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error deleting subtask:', error);
    throw error;
  }
};

export const updateQuestionnaireAssignmentStatus = async (assignmentData) => {
  try {
    const response = await apiService.put('/admin/subtask-questionnaire-assignments/update-status', {
      assignmentId: assignmentData.assignmentId,
      status: assignmentData.status
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating questionnaire assignment status:', error);
    throw error;
  }
};

export const getSubtasksByTaskAndStudent = async (taskId, studentId) => {
  if (!taskId || !studentId) {
    throw new Error('Task ID and Student ID are required');
  }

  try {
    const response = await apiService.get(`/admin/subtask/${taskId}?studentId=${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student subtasks:', error);
    throw error;
  }
};
