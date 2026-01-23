import { apiService } from './api.services';

/**
 * Get all documents for admin
 * @param {Object} params Query parameters for pagination and filtering
 * @returns {Promise<Array>} Array of documents with studentId, taskId, and subtaskId
 */
export const getDocuments = async ({
  page = 1,
  limit = 10,
  status,
  search,
  fileType,
  dateFrom,
  dateTo,
  sortBy,
  sortOrder
} = {}) => {
  let url = `/admin/documents?page=${page}&limit=${limit}`;

  if (status && status !== 'all') {
    url += `&status=${status}`;
  }

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  if (fileType && fileType !== 'all') {
    url += `&fileType=${fileType}`;
  }

  if (dateFrom) {
    url += `&dateFrom=${dateFrom}`;
  }

  if (dateTo) {
    url += `&dateTo=${dateTo}`;
  }

  if (sortBy) {
    url += `&sortBy=${sortBy}`;
  }

  if (sortOrder) {
    url += `&sortOrder=${sortOrder}`;
  }

  const response = await apiService.get(url);
  return response;
};
/**
 * Create a new document
 * @param {Object} data Document data
 */
export const createDocument = async (data) => {
  return await apiService.post('/admin/documents', data);
};

export const uploadDocument = async (documentData) => {
  return await apiService.post('/admin/documents', {
    studentId: documentData.get('studentId'),
    taskId: documentData.get('taskId'),
    subtaskId: documentData.get('subtaskId'),
    fileUrl: documentData.get('fileUrl'),
    fileName: documentData.get('fileName'),
    fileSize: Number(documentData.get('fileSize')),
    fileType: documentData.get('fileType')
  });
};

export const updateDocument = async (documentId, data) => {
  return await apiService.put(`/admin/documents/${documentId}`, data);
};

export const deleteDocument = async (documentId) => {
  return await apiService.delete(`/admin/documents/${documentId}`);
};

export const getDocumentById = async (documentId) => {
  return await apiService.get(`/admin/documents/${documentId}`);
};

export const getSubtaskDocuments = async (taskId, subtaskId) => {
  return await apiService.get(`/student/tasks/${taskId}/subtasks/${subtaskId}/documents`);
};

// Export the service object as well
export const documentService = {
  createDocument,
  uploadDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  getDocumentById,
  getSubtaskDocuments
};
