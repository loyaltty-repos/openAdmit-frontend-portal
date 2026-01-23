import { servicesAxiosInstance } from './config';

export const apiService = {
  get: async (endpoint) => {
    const response = await servicesAxiosInstance.get(endpoint);
    return response.data;
  },

  post: async (endpoint, data) => {
    const response = await servicesAxiosInstance.post(endpoint, data);
    return response.data;
  },

  put: async (endpoint, data) => {
    const response = await servicesAxiosInstance.put(endpoint, data);
    return response.data;
  },

  delete: async (endpoint) => {
    const response = await servicesAxiosInstance.delete(endpoint);
    return response.data;
  }
};

export const getServerStatus = async () => {
  return apiService.get('/self');
};

export const getServerHealth = async () => {
  return apiService.get('/health');
};

export const sendEmailOtp = async (email) => {
  try {
    const response = await apiService.post('/auth/send-email-otp', { email });
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send OTP'
    };
  }
};
export const registerUser = async (userData) => {
  try {
    const response = await apiService.post('/auth/signup', userData);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Signup failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Signup failed'
    };
  }
};
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiService.post('/auth/forgot-password', { email });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to request reset'
    };
  }
};
export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await apiService.post('/auth/verify-otp', { email, otp });
    return { success: true, data: response };
  } catch (error) {
    console.error('OTP verification failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid or expired OTP'
    };
  }
};
export const setNewPassword = async ({ email, otp, password }) => {
  try {
    const response = await apiService.post('/auth/reset-password', {
      email,
      otp,
      password
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Password reset failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reset password'
    };
  }
};
export const loginUser = async (userData) => {
  return apiService.post('/auth/login', userData);
};

export const getUserProfile = async () => {
  return apiService.get('/student/self');
};

export const getAssignedUniversities = async () => {
  return apiService.get('/student/llm-assigned-university?preferredSpeed=FAST');
};

export const updateUserProfile = async (profileData) => {
  return apiService.put('/student/profile', profileData);
};

export const getStudentQuestionnaireResponses = async (taskId, page = 1, limit = 10) => {
  return servicesAxiosInstance.get(`/admin/tasks/${taskId}/responses`, {
    params: { page, limit }
  });
};
export const uploadFile = async (formData) => {
  return apiService.post('/upload-file', formData);
};

export const adminLogin = async (data) => {
  return apiService.post('/admin/auth/login', data);
};

export const updatePassword = async (passwordData) => {
  return apiService.post('/admin/auth/update-password', passwordData);
};

export const getCurrentUser = async () => {
  return apiService.get('/admin/self');
};

export const updateProfile = async (profileData) => {
  return apiService.put('/admin/profile', profileData);
};

export const getCategories = async () => {
  try {
    const response = await apiService.get('/categories');
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch categories'
    };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await apiService.post('/admin/categories', categoryData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create category'
    };
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await apiService.put(`/admin/categories/${id}`, data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update category'
    };
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await apiService.delete(`/admin/categories/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete category'
    };
  }
};

export const getFaqs = async (categoryId = null) => {
  try {
    const url = categoryId ? `/faqs?categoryId=${categoryId}` : '/faqs';
    const response = await apiService.get(url);
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch FAQs'
    };
  }
};

export const createFaq = async (faqData) => {
  try {
    const response = await apiService.post('/admin/faqs', faqData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create FAQ'
    };
  }
};

export const updateFaq = async (id, data) => {
  try {
    const response = await apiService.put(`/admin/faqs/${id}`, data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update FAQ'
    };
  }
};

export const deleteFaq = async (id) => {
  try {
    const response = await apiService.delete(`/admin/faqs/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete FAQ'
    };
  }
};

export const getStudentById = async (studentId) => {
  return apiService.get(`/admin/students/${studentId}`);
};


export const uploadDocumentUrl = async (taskId, questionnaireId, documentURL,studentId) => {
  try {
    const response = await apiService.put(`/admin/tasks/${taskId}/upload-documents`, {
      questionnaireId,
      documentURL,
      documentStatus: "UPLOADED",
      studentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};