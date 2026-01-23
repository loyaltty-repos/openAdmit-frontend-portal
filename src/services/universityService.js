import axios from 'axios';
import { servicesAxiosInstance } from './config';

export const getUniversities = async (params) => {
  try {

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => 
        value !== null && value !== '' && value !== undefined
      )
    );

    const response = await servicesAxiosInstance.get(`/admin/universities`, {
      params: cleanParams
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};

export const getUniversityById = async (id) => {
  const response = await servicesAxiosInstance.get(`/admin/universities/${id}`);
  return response.data;
};

export const createUniversity = async (data) => {
  const response = await servicesAxiosInstance.post('/admin/universities', data);
  return response.data;
};

export const updateUniversity = async (id, data) => {
  const response = await servicesAxiosInstance.put(`/admin/universities/${id}`, data);
  return response.data;
};

export const deleteUniversity = async (id) => {
  const response = await servicesAxiosInstance.delete(`/admin/universities/${id}`);
  return response.data;
};

export const findUniversities = async (params) => {
  try {
    // Clean up params to remove any empty values
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== '' && value !== undefined) {
        cleanParams[key] = value;
      }
    }
    
    // Make the API call to find universities based on parameters
    const response = await servicesAxiosInstance.get('/universities/find', {
      params: cleanParams
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
