import { ISeatMapItem, ISeatMapSummary, IRecoveryStatus } from '../../types/seatMap.types';
import { ICandidate } from '../../models/Candidate';

export interface ISeatMapData {
  seats: ISeatMapItem[];
  summary: ISeatMapSummary;
  unassignedCandidates: ICandidate[];
}

export interface ISeatMapService {
  getSeatMap(sessionId: string): Promise<ISeatMapData>;
  getRecoveryStatus(sessionId: string): Promise<IRecoveryStatus>;
}
