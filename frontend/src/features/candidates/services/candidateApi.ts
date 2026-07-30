import { apiClient } from '../../../services/api/apiClient';
import { Candidate, CreateCandidateRequest, UpdateCandidateRequest, CandidateListResponse, BulkImportResult } from '../types/candidate.types';import { TAny } from '../../../types/any';


export const candidateApi = {
  getCandidatesBySession: async (sessionId: string, page: number = 1, limit: number = 50) => {
    const response = await apiClient.get<{ success: boolean; data: CandidateListResponse }>(
      `/sessions/${sessionId}/candidates?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  getCandidate: async (candidateId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Candidate }>(`/candidates/${candidateId}`);
    return response.data.data;
  },

  createCandidate: async (sessionId: string, data: CreateCandidateRequest) => {
    const response = await apiClient.post<{ success: boolean; data: Candidate }>(
      `/sessions/${sessionId}/candidates`,
      data
    );
    return response.data.data;
  },

  updateCandidate: async (candidateId: string, data: UpdateCandidateRequest) => {
    const response = await apiClient.patch<{ success: boolean; data: Candidate }>(
      `/candidates/${candidateId}`,
      data
    );
    return response.data.data;
  },

  deleteCandidate: async (candidateId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/candidates/${candidateId}`);
    return response.data;
  },

  bulkImport: async (sessionId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ success: boolean; data: BulkImportResult }>(
      `/sessions/${sessionId}/candidates/import`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  finalizeCandidates: async (sessionId: string) => {
    const response = await apiClient.patch<{ success: boolean; data: TAny }>(
      `/sessions/${sessionId}/candidates/finalize`
    );
    return response.data.data;
  },
};
