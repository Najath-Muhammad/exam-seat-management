import { apiClient } from '../../../services/api/apiClient';
import { SeatMapData, RecoveryStatus } from '../types/seatMap.types';

export const seatMapApi = {
  getSeatMap: async (sessionId: string) => {
    const response = await apiClient.get<{ success: boolean; data: SeatMapData }>(
      `/sessions/${sessionId}/seat-map`
    );
    return response.data.data;
  },

  getRecoveryStatus: async (sessionId: string) => {
    const response = await apiClient.get<{ success: boolean; data: RecoveryStatus }>(
      `/sessions/${sessionId}/seat-map/recovery-status`
    );
    return response.data.data;
  }
};
