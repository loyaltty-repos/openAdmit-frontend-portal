import { servicesAxiosInstance } from './config';

export const getAdminStudentActivities = async (page = 1, limit = 5 , params) => {
  try {
    const response = await servicesAxiosInstance.get('/admin/student-activities', {
      params: { page, limit , search: params.search , status: params.status}
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAdminDashboardStats = async () => {
  try {
    const response = await servicesAxiosInstance.get('/admin/dashboard-stats');
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getAdminUpcomingDeadlines = async (page = 1, limit = 10) => {
  try {
    const response = await servicesAxiosInstance.get('/admin/upcoming-deadlines', {
      params: { page, limit }
    });
    return response.data;
  } catch (err) {
    console.warn('Upcoming deadlines endpoint not available:', err.response?.status);
    // If it's a 404, return an empty data structure instead of throwing
    if (err.response?.status === 404) {
      return { success: true, data: { upcomingDeadlines: [] } };
    }
    throw err.response?.data || err;
  }
};
export const markStudentActivityAsRead = async (activityId) => {
  try {
    const response = await servicesAxiosInstance.put(`/admin/student-activities/${activityId}/mark-read`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};