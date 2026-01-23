import { servicesAxiosInstance } from './config';

/**
 * Fetches dashboard statistics for the student
 * @returns {Promise} - The API response containing dashboard stats
 */
export const getStudentDashboardStats = async () => {
  try {
    const response = await servicesAxiosInstance.get('/student/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetches upcoming tasks for the student
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Number of items per page (default: 10)
 * @returns {Promise} - The API response containing upcoming tasks
 */
export const getStudentUpcomingTasks = async (params = { page: 1, limit: 10 }) => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => 
        value !== null && value !== '' && value !== undefined
      )
    );
    
    const response = await servicesAxiosInstance.get('/student/upcoming-task', {
      params: cleanParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    throw error;
  }
};
