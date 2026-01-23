import { servicesAxiosInstance } from './config';

export const uploadFile = async (formData) => {
  const response = await servicesAxiosInstance.post('/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
