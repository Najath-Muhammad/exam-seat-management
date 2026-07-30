import { apiClient } from '../../../services/api/apiClient';
import { SeatAssignment, AssignSeatRequest, ReassignSeatRequest, MoveSessionRequest, AutoAssignResult, InitialAllocationResult } from '../types/seatAssignment.types';
import { Seat } from '../../seats/types/seat.types';

export const seatAssignmentApi = {
  getSessionAssignments: async (sessionId: string) => {
    const response = await apiClient.get<{ success: boolean; data: SeatAssignment[] }>(
      `/sessions/${sessionId}/assignments`
    );
    return response.data.data;
  },

  getAvailableSeats: async (sessionId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Seat[] }>(
      `/sessions/${sessionId}/assignments/seats/available`
    );
    return response.data.data;
  },

  assignSeat: async (sessionId: string, data: AssignSeatRequest) => {
    const response = await apiClient.post<{ success: boolean; data: SeatAssignment }>(
      `/sessions/${sessionId}/assignments`,
      data
    );
    return response.data.data;
  },

  autoAssignSeats: async (sessionId: string) => {
    const response = await apiClient.post<{ success: boolean; data: AutoAssignResult }>(
      `/sessions/${sessionId}/assignments/auto`
    );
    return response.data.data;
  },

  reassignSeat: async (assignmentId: string, data: ReassignSeatRequest) => {
    const response = await apiClient.patch<{ success: boolean; data: SeatAssignment }>(
      `/assignments/${assignmentId}/reassign`,
      data
    );
    return response.data.data;
  },

  cancelAssignment: async (assignmentId: string) => {
    const response = await apiClient.patch<{ success: boolean; data: SeatAssignment }>(
      `/assignments/${assignmentId}/cancel`
    );
    return response.data.data;
  },

  moveCandidateToSession: async (assignmentId: string, data: MoveSessionRequest) => {
    const response = await apiClient.patch<{ success: boolean; data: SeatAssignment }>(
      `/assignments/${assignmentId}/move-session`,
      data
    );
    return response.data.data;
  },

  getCandidateAssignment: async (candidateId: string) => {
    const response = await apiClient.get<{ success: boolean; data: SeatAssignment[] }>(
      `/candidates/${candidateId}/assignment`
    );
    return response.data.data;
  },

  runInitialAllocation: async (sessionId: string) => {
    const response = await apiClient.post<{ success: boolean; data: InitialAllocationResult }>(
      `/sessions/${sessionId}/initial-allocation`
    );
    return response.data.data;
  }
};
