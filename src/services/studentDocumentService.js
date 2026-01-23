import { apiService } from './api.services';

function buildQueryString(params = {}) {
  const query = { page: 1, limit: 1, ...params };
  const search = new URLSearchParams(query).toString();
  return search ? `?${search}` : '';
}

/**
 * Get all documents for the student
 * @param {Object} params Query parameters for pagination and filtering
 * @returns {Promise<Object>} Response with documents and pagination
 */
export const getStudentDocuments = async (params = {}) => {
  const queryString = buildQueryString(params);
  return await apiService.get(`/student/tasks/documents${queryString}`);
};

/**
 * Get documents for a specific subtask for the student
 * @param {string} taskId
 * @param {string} subtaskId
 * @param {Object} params Query parameters for pagination and filtering
 * @returns {Promise<Object>} Response with documents
 */
export const getStudentSubtaskDocuments = async (taskId, subtaskId, params = {}) => {
  const queryString = buildQueryString(params);
  return await apiService.get(`/student/tasks/${taskId}/subtasks/${subtaskId}/documents${queryString}`);
};

export const studentDocumentService = {
  getStudentDocuments,
  getStudentSubtaskDocuments
};
