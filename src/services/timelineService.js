import { servicesAxiosInstance } from './config';

export const getStudentTimeline = async (studentId, params = { page: 1, limit: 10 }) => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => 
        value !== null && value !== '' && value !== undefined
      )
    );

    const endpoint = studentId 
      ? `/admin/timeline/student/${studentId}`
      : `/student/timeline`;
    
    const response = await servicesAxiosInstance.get(endpoint, {
      params: cleanParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student timeline:', error);
    throw error;
  }
};

export const updateTimelineItem = async (itemId, itemType, data) => {
  try {
    const response = await servicesAxiosInstance.put(`/admin/timeline/${itemType}/${itemId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${itemType}:`, error);
    throw error;
  }
};
