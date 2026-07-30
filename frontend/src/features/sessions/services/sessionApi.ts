import { apiClient } from '../../../services/api/apiClient';
import { Session, CreateSessionRequest, UpdateSessionRequest, Exam } from '../types/session.types';

export const sessionApi = {
  getExams: async () => {
    const response = await apiClient.get<{ success: boolean; data: Exam[] }>('/exams');
    return response.data.data;
  },

  getExam: async (examId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Exam }>(`/exams/${examId}`);
    return response.data.data;
  },

  getSessions: async (examId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Session[] }>(`/exams/${examId}/sessions`);
    return response.data.data;
  },

  getSession: async (sessionId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Session }>(`/sessions/${sessionId}`);
    return response.data.data;
  },

  createSession: async (examId: string, data: CreateSessionRequest) => {
    const response = await apiClient.post<{ success: boolean; data: Session }>(`/exams/${examId}/sessions`, data);
    return response.data.data;
  },

  updateSession: async (sessionId: string, data: UpdateSessionRequest) => {
    const response = await apiClient.patch<{ success: boolean; data: Session }>(`/sessions/${sessionId}`, data);
    return response.data.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/sessions/${sessionId}`);
    return response.data;
  }
};
