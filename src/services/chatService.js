import { servicesAxiosInstance } from './config';

export const getAllStudents = async({page=1 , limit=10 , search})=>{
  return servicesAxiosInstance.get(`/chat/admin/students?page=${page}&limit=${limit}&search=${search}`);
}
export const getChatsAdmin = async({page =1 , search})=>{
  return servicesAxiosInstance.get(`/chat/admin/rooms?page=${page}&search=${search}`);
}
export const generateAdminToken = async(Data)=>{
  return servicesAxiosInstance.post(`/chat/admin/generate-token` ,Data);
}


export const getChatsStudents = async({page})=>{
  return servicesAxiosInstance.get(`/chat/student/rooms?page${page}`);
}
export const generateStudentToken = async({Data})=>{
  return servicesAxiosInstance.post(`/chat/student/generate-token` ,Data);
}


// =========================
// Chat Presence (Student/Admin)
// =========================

/**
 * STUDENT: set own presence
 * POST /chat/student/presence
 * body: { isOnline: boolean }
 */
export const setStudentChatPresence = async (isOnline) => {
  return servicesAxiosInstance.post('/chat/student/presence', { isOnline: !!isOnline });
};

/**
 * STUDENT: get admin presence
 * GET /chat/student/presence/admin/:adminId
 */
export const getAdminChatPresence = async (adminId) => {
  return servicesAxiosInstance.get(`/chat/student/presence/admin/${adminId}`);
};

/**
 * ADMIN: set own presence
 * POST /chat/admin/presence
 * body: { isOnline: boolean }
 */
export const setAdminChatPresence = async (isOnline) => {
  return servicesAxiosInstance.post('/chat/admin/presence', { isOnline: !!isOnline });
};

/**
 * ADMIN: get student presence
 * GET /chat/admin/presence/student/:studentId
 */
export const getStudentChatPresence = async (studentId) => {
  return servicesAxiosInstance.get(`/chat/admin/presence/student/${studentId}`);
};