import { servicesAxiosInstance } from './config';

export const getApplications = async (params = {}) => {
  const response = await servicesAxiosInstance.get('/admin/applications', { params });
  return response.data;
};

export const getApplicationById = async ({applicationId}) => {
  const response = await servicesAxiosInstance.get(`/admin/applications/${applicationId}`);
  return response.data;
};

export const createApplication = async (data) => {
  const response = await servicesAxiosInstance.post('/admin/applications', data);
  return response.data;
};

export const updateApplication = async (applicationId, data) => {
  const response = await servicesAxiosInstance.put(`/admin/applications/${applicationId}`, data);
  return response.data;
};

export const deleteApplication = async (applicationId) => {
  const response = await servicesAxiosInstance.delete(`/admin/applications/${applicationId}`);
  return response.data;
};
