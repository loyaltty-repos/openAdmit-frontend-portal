import { servicesAxiosInstance } from './config';

export const getCategories = async () => {
  try {
    const response = await servicesAxiosInstance.get('/admin/task-categories');
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await servicesAxiosInstance.post('/admin/task-categories', categoryData);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await servicesAxiosInstance.put(`/admin/task-categories/${categoryId}`, categoryData);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await servicesAxiosInstance.delete(`/admin/task-categories/${categoryId}`);
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
