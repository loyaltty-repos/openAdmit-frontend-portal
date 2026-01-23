import { servicesAxiosInstance } from './config';

export const getTeamMembers = async (params = { page: 1, limit: 10 }) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await servicesAxiosInstance.get(`/admin/members?${queryString}`);
  return response.data;
};

export const addTeamMember = async (memberData) => {
  const response = await servicesAxiosInstance.post('/admin/create-member', memberData);
  return response.data;
};

export const updateTeamMember = async (memberId, updateData) => {
  const response = await servicesAxiosInstance.put(`/admin/update-profile/${memberId}`, updateData);
  return response.data;
};

export const deleteTeamMember = async (memberId) => {
  const response = await servicesAxiosInstance.delete(`/admin/members/${memberId}`);
  return response.data;
};
