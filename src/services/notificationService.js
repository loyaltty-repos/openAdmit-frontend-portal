// src/services/notificationService.js
import { servicesAxiosInstance } from './config';

/**
 * Utility: remove null/undefined/empty params
 */
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== '' && value !== undefined)
  );

/**
 * STUDENT: Get notifications
 * GET /notifications/student
 * Supports query: page, limit, sortOrder, isRead, type, q
 */
export const getStudentNotifications = async (params = { page: 1, limit: 10 }) => {
  try {
    const response = await servicesAxiosInstance.get('/notifications/student', {
      params: cleanParams(params),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    throw error;
  }
};

/**
 * STUDENT: Get notification by id
 * GET /notifications/student/:notificationId
 */
export const getStudentNotificationById = async (notificationId) => {
  try {
    const response = await servicesAxiosInstance.get(`/notifications/student/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student notification by id:', error);
    throw error;
  }
};

/**
 * STUDENT: Mark notification as read
 * PUT /notifications/student/:notificationId
 */
export const markStudentNotificationAsRead = async (notificationId) => {
  try {
    const response = await servicesAxiosInstance.put(`/notifications/student/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking student notification as read:', error);
    throw error;
  }
};

/**
 * ADMIN: Get notifications
 * GET /notifications/admin
 */
export const getAdminNotifications = async (params = { page: 1, limit: 10 }) => {
  try {
    const response = await servicesAxiosInstance.get('/notifications/admin', {
      params: cleanParams(params),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    throw error;
  }
};

/**
 * ADMIN: Get notification by id
 * GET /notifications/admin/:notificationId
 */
export const getAdminNotificationById = async (notificationId) => {
  try {
    const response = await servicesAxiosInstance.get(`/notifications/admin/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notification by id:', error);
    throw error;
  }
};

/**
 * ADMIN: Mark notification as read
 * PUT /notifications/admin/:notificationId
 */
export const markAdminNotificationAsRead = async (notificationId) => {
  try {
    const response = await servicesAxiosInstance.put(`/notifications/admin/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking admin notification as read:', error);
    throw error;
  }
};


// =========================
// Chat message notifications
// =========================

/**
 * STUDENT -> ADMIN
 * POST /notifications/student/chat-messages
 * body: { adminId, title, message }
 */
export const sendChatMessageNotificationToAdmin = async ({ adminId, title, message }) => {
  try {
    const response = await servicesAxiosInstance.post('/notifications/student/chat-messages', {
      adminId,
      title,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message notification to admin:', error);
    throw error;
  }
};

/**
 * ADMIN -> STUDENT
 * POST /notifications/admin/chat-messages/:studentId
 * body: { title, message }
 */
export const sendChatMessageNotificationToStudent = async (studentId, { title, message }) => {
  try {
    const response = await servicesAxiosInstance.post(`/notifications/admin/chat-messages/${studentId}`, {
      title,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message notification to student:', error);
    throw error;
  }
};