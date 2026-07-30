import { apiClient } from '../../../services/api/apiClient';

export interface Complaint {
  _id: string;
  candidateId: any;
  sessionId: any;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  resolutionRemarks?: string;
  createdAt: string;
}

export const complaintApi = {
  registerComplaint: async (candidateId: string, sessionId: string, description: string): Promise<Complaint> => {
    const response = await apiClient.post<{ success: boolean; data: Complaint }>('/complaints', {
      candidateId,
      sessionId,
      description
    });
    return response.data.data;
  },

  getSessionComplaints: async (sessionId: string): Promise<Complaint[]> => {
    const response = await apiClient.get<{ success: boolean; data: Complaint[] }>(`/complaints/session/${sessionId}`);
    return response.data.data;
  },

  updateComplaintStatus: async (id: string, status: string, remarks?: string): Promise<Complaint> => {
    const response = await apiClient.patch<{ success: boolean; data: Complaint }>(`/complaints/${id}/status`, {
      status,
      remarks
    });
    return response.data.data;
  }
};
