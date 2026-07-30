import { apiClient } from '../../../services/api/apiClient';
import { Seat, CreateSeatRequest, UpdateSeatRequest, GenerateSeatsRequest, GenerateSeatsResult, SeatListResponse } from '../types/seat.types';

export const seatApi = {
  getSeats: async (page: number = 1, limit: number = 50, status?: string, row?: string) => {
    let url = `/seats?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (row) url += `&row=${row}`;
    
    const response = await apiClient.get<{ success: boolean; data: SeatListResponse }>(url);
    return response.data.data;
  },

  getSeat: async (seatId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Seat }>(`/seats/${seatId}`);
    return response.data.data;
  },

  createSeat: async (data: CreateSeatRequest) => {
    const response = await apiClient.post<{ success: boolean; data: Seat }>('/seats', data);
    return response.data.data;
  },

  updateSeat: async (seatId: string, data: UpdateSeatRequest) => {
    const response = await apiClient.patch<{ success: boolean; data: Seat }>(`/seats/${seatId}`, data);
    return response.data.data;
  },

  deleteSeat: async (seatId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/seats/${seatId}`);
    return response.data;
  },

  generateSeats: async (data: GenerateSeatsRequest) => {
    const response = await apiClient.post<{ success: boolean; data: GenerateSeatsResult }>('/seats/generate', data);
    return response.data.data;
  }
};
