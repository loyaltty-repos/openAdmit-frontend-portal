import { apiService as api } from './api.services';

export const getLoans = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.admissionTerm) queryParams.append('admissionTerm', params.admissionTerm);
  if (params.search) queryParams.append('search', params.search);

  return api.get(`/loans?${queryParams.toString()}`);
};

export const getLoanById = async (id) => {
  return api.get(`/loans/${id}`);
};

export const createLoan = async (data) => {
  return api.post('/loans', data);
};

export const updateLoan = async (id, data) => {
  return api.put(`/loans/${id}`, data);
};

export const deleteLoan = async (id) => {
  return api.delete(`/loans/${id}`);
};
