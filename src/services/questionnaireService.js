import { apiService } from './api.services';

export const createQuestionnaire = async (data) => {
  return await apiService.post('/admin/questionnaires', data);
};

export const updateQuestionnaire = async (questionnaireId, data) => {
  return await apiService.put(`/admin/questionnaires/${questionnaireId}`, data);
};

export const deleteQuestionnaire = async (questionnaireId) => {
  return await apiService.delete(`/admin/questionnaires/${questionnaireId}`);
};

export const getQuestionnaires = async ({ questionnairsFilter } = {}) => {
  return await apiService.get(
    `/admin/questionnaires?page=${questionnairsFilter?.page || 1}${
      questionnairsFilter?.search ? `&search=${questionnairsFilter.search}` : ''
    }${
      questionnairsFilter?.status ? `&status=${questionnairsFilter.status}` : ''
    }`
  );
};

export const getQuestionnaireById = async (questionnaireId) => {
  return await apiService.get(`/admin/questionnaires/${questionnaireId}`);
};

export const addQuestion = async (questionnaireId, data) => {
  return await apiService.post(`/admin/questionnaires/${questionnaireId}/questions`, data);
};

export const removeQuestion = async (questionnaireId, data) => {
  return await apiService.delete(`/admin/questionnaires/${questionnaireId}/questions`, { data });
};

export const getSubtaskQuestionnaires = async (taskId, subtaskId) => {
  try {
    const response = await apiService.get(
      `/student/tasks/${taskId}/subtasks/${subtaskId}/questionnaires`
    );
    return response;
  } catch (error) {
    console.error('Error fetching questionnaires:', error);
    throw error;
  }
};

export const getQuestionnaireQuestions = async (taskId, subtaskId, questionnaireId) => {
  try {
    const response = await apiService.get(
      `/student/tasks/${taskId}/subtasks/${subtaskId}/questionnaires/${questionnaireId}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching questionnaire questions:', error);
    throw error;
  }
};

export const submitQuestionnaireResponses = async (data) => {
  try {
    const response = await apiService.post(
      '/student/tasks/subtasks/questionnaires/question/responses',
      data
    );
    return response;
  } catch (error) {
    console.error('Error submitting questionnaire responses:', error);
    throw error;
  }
};


export const getTaskSubtaskQuestionDetails = async ({studentId , page=1 , limit =10}={}) => {
  try {
    const response = await apiService.get(`/admin/students/${studentId}/task-subtask-question-details?page=${page}&limit=${limit}`);
    

    if (response && response.data) {
      const data = response.data;
      if (data.student && data.student.tasks) {

        const directQuestionnaireMap = {};
        
        data.student.tasks.forEach(taskData => {
          const subtasks = taskData.subtasks || [];
          
          subtasks.forEach(subtask => {
            const questionnaires = subtask.questionnaires || [];
            

            if (questionnaires.length > 0) {

              if (subtask._id) {
                directQuestionnaireMap[subtask._id] = questionnaires;
              }
              

              if (subtask.assignmentId) {
                directQuestionnaireMap[subtask.assignmentId] = questionnaires;
              }
              

              if (typeof subtask.subtaskId === 'object' && subtask.subtaskId?._id) {
                directQuestionnaireMap[subtask.subtaskId._id] = questionnaires;
              }
              

              if (typeof subtask.subtaskId === 'string') {
                directQuestionnaireMap[subtask.subtaskId] = questionnaires;
              }
            }
          });
        });
        

        return {
          ...response.data,
          success: true,
          questionnaireMap: directQuestionnaireMap
        };
      } else {
        console.warn('API response is missing expected structure (student.tasks)');
      }
    }
    
    return {
      ...response.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching task-subtask-question details:', error);
    throw error;
  }
};
