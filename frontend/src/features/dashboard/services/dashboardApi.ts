import { apiClient } from '../../../services/api/apiClient';
import { IDashboardData, IHistoryResponse, HistoryAction } from '../types/dashboard.types';

export const dashboardApi = {
  getOverview: async (examId?: string, sessionId?: string): Promise<IDashboardData> => {
    const params = new URLSearchParams();
    if (examId) params.append('examId', examId);
    if (sessionId) params.append('sessionId', sessionId);

    const response = await apiClient.get<{ success: boolean; data: IDashboardData }>(`/admin/dashboard/overview?${params.toString()}`);
    return response.data.data;
  },

  getHistory: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      examId?: string;
      sessionId?: string;
      candidateId?: string;
      seatId?: string;
      action?: HistoryAction;
    }
  ): Promise<IHistoryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await apiClient.get<{ success: boolean; data: IHistoryResponse }>(`/admin/history?${params.toString()}`);
    return response.data.data;
  }
};
