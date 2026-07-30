export interface IInitialAllocationResult {
  totalCandidates: number;
  alreadyAssigned: number;
  newlyAllocated: number;
  unallocated: number;
  status: 'COMPLETE' | 'PARTIAL' | 'NOT_STARTED';
}

export interface IInitialAllocationService {
  runInitialAllocation(sessionId: string, adminId: string): Promise<IInitialAllocationResult>;
}
