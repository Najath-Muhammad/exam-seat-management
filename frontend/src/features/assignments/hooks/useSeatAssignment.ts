import { useState, useEffect, useCallback } from 'react';
import { seatAssignmentApi } from '../services/seatAssignmentApi';
import { seatMapApi } from '../services/seatMapApi';
import { sessionApi } from '../../sessions/services/sessionApi';
import { SeatMapData, RecoveryStatus } from '../types/seatMap.types';
import { SeatAssignment, InitialAllocationResult } from '../types/seatAssignment.types';
import { Session } from '../../sessions/types/session.types';
import { Seat } from '../../seats/types/seat.types';

export const useSeatAssignment = (examId: string | undefined, sessionId: string | undefined) => {
  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus | null>(null);
  const [historyAssignments, setHistoryAssignments] = useState<SeatAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [targetAvailableSeats, setTargetAvailableSeats] = useState<Seat[]>([]);
  const [isFetchingTargetSeats, setIsFetchingTargetSeats] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationResult, setAllocationResult] = useState<InitialAllocationResult | null>(null);

  const fetchData = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const [mapData, recStatus, assigData] = await Promise.all([
        seatMapApi.getSeatMap(sessionId),
        seatMapApi.getRecoveryStatus(sessionId),
        seatAssignmentApi.getSessionAssignments(sessionId)
      ]);
      setSeatMap(mapData);
      setRecoveryStatus(recStatus);
      setHistoryAssignments(assigData);
      setError(null);
    } catch (err: TAny) {
      setError(err.response?.data?.message || 'Failed to load seat map data');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const manualAssign = async (candidateId: string, seatId: string) => {
    if (!sessionId) return;
    await seatAssignmentApi.assignSeat(sessionId, { candidateId, seatId });
    await fetchData();
  };

  const reassignSeat = async (assignmentId: string, newSeatId: string, reason: string) => {
    await seatAssignmentApi.reassignSeat(assignmentId, { newSeatId, reason });
    await fetchData();
  };

  const loadTargetSessions = async (currentSessionId: string) => {
    if (!examId) return;
    const sessions = await sessionApi.getSessions(examId);
    setAvailableSessions(sessions.filter(s => s._id !== currentSessionId && s.status !== 'COMPLETED'));
    setTargetAvailableSeats([]);
  };

  const loadTargetSeats = async (newSessionId: string) => {
    setIsFetchingTargetSeats(true);
    try {
      const seats = await seatAssignmentApi.getAvailableSeats(newSessionId);
      setTargetAvailableSeats(seats);
    } catch (err) {
      setTargetAvailableSeats([]);
      throw err;
    } finally {
      setIsFetchingTargetSeats(false);
    }
  };

  const moveSession = async (assignmentId: string, newSessionId: string, newSeatId: string, reason: string) => {
    await seatAssignmentApi.moveCandidateToSession(assignmentId, { newSessionId, newSeatId, reason });
    await fetchData();
  };

  const cancelAssignment = async (assignmentId: string) => {
    await seatAssignmentApi.cancelAssignment(assignmentId);
    await fetchData();
  };

  const runInitialAllocation = async () => {
    if (!sessionId) return;
    setIsAllocating(true);
    setAllocationResult(null);
    try {
      const result = await seatAssignmentApi.runInitialAllocation(sessionId);
      setAllocationResult(result);
      await fetchData();
      return result;
    } finally {
      setIsAllocating(false);
    }
  };

  return {
    seatMap,
    recoveryStatus,
    historyAssignments,
    isLoading,
    error,
    fetchData,
    manualAssign,
    reassignSeat,
    loadTargetSessions,
    loadTargetSeats,
    availableSessions,
    targetAvailableSeats,
    isFetchingTargetSeats,
    moveSession,
    cancelAssignment,
    runInitialAllocation,
    isAllocating,
    allocationResult,
  };
};
