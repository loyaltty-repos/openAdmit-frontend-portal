import { servicesAxiosInstance } from './config';

export const getStudents = async (params = { page: 1, limit: 10 }) => {

    const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => 
      value !== null && value !== '' && value !== undefined
    )
  );

  const response = await servicesAxiosInstance.get('/admin/students', {
    params: cleanParams
  });
  return response.data;
};
export const getStudentForAdmin = async ({params}={}) => {
  const response = await servicesAxiosInstance.get(`/admin/students`, {params});
  return response.data;
};


export const getStudentById = async (studentId) => {
  const response = await servicesAxiosInstance.get(`/admin/students/${studentId}`);
  return response.data;
};

export const createStudent = async (data) => {
  const response = await servicesAxiosInstance.post('/admin/students', data);
  return response.data;
};

export const updateStudent = async (studentId, data) => {
  const response = await servicesAxiosInstance.put(`/admin/students/${studentId}`, data);
  return response.data;
};

export const deleteStudent = async (studentId) => {
  const response = await servicesAxiosInstance.delete(`/admin/students/${studentId}`);
  return response.data;
};
