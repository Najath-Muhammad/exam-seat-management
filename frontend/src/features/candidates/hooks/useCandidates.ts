import { useState, useEffect, useCallback } from 'react';
import { candidateApi } from '../services/candidateApi';
import { sessionApi } from '../../sessions/services/sessionApi';
import { CandidateListResponse, BulkImportResult } from '../types/candidate.types';
import { Session } from '../../sessions/types/session.types';

export const useCandidates = (sessionId: string | undefined) => {
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<CandidateListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);

  const fetchData = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const [sessionData, candidatesData] = await Promise.all([
        sessionApi.getSession(sessionId),
        candidateApi.getCandidatesBySession(sessionId, page, limit)
      ]);
      setSession(sessionData);
      setData(candidatesData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const finalizeList = async () => {
    if (!sessionId) return;
    setIsFinalizing(true);
    try {
      await candidateApi.finalizeCandidates(sessionId);
      await fetchData();
    } finally {
      setIsFinalizing(false);
    }
  };

  const importCSV = async (file: File) => {
    if (!sessionId) return;
    setImportResult(null);
    setIsImporting(true);
    try {
      const result = await candidateApi.bulkImport(sessionId, file);
      setImportResult(result);
      await fetchData();
    } finally {
      setIsImporting(false);
    }
  };

  const addCandidate = async (newCandidate: any) => {
    if (!sessionId) return;
    await candidateApi.createCandidate(sessionId, newCandidate);
    await fetchData();
  };

  const deleteCandidate = async (candidateId: string) => {
    await candidateApi.deleteCandidate(candidateId);
    await fetchData();
  };

  return {
    session,
    data,
    page,
    setPage,
    isLoading,
    error,
    isFinalizing,
    finalizeList,
    isImporting,
    importResult,
    setImportResult,
    importCSV,
    addCandidate,
    deleteCandidate
  };
};
