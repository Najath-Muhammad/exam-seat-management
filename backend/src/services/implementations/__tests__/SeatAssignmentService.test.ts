import mongoose from 'mongoose';
import { SeatAssignmentService } from '../SeatAssignmentService';
import { ISeatAssignmentRepository } from '../../../repositories/interfaces/ISeatAssignmentRepository';
import { ICandidateRepository } from '../../../repositories/interfaces/ICandidateRepository';
import { ISeatRepository } from '../../../repositories/interfaces/ISeatRepository';
import { ISessionRepository } from '../../../repositories/interfaces/ISessionRepository';
import { IAssignmentHistoryRepository } from '../../../repositories/interfaces/IAssignmentHistoryRepository';
import { ConflictError } from '../../../errors';

describe('SeatAssignmentService - Transactions & Concurrency', () => {
  let seatAssignmentService: SeatAssignmentService;
  let mockAssignmentRepo: jest.Mocked<ISeatAssignmentRepository>;
  let mockCandidateRepo: jest.Mocked<ICandidateRepository>;
  let mockSeatRepo: jest.Mocked<ISeatRepository>;
  let mockSessionRepo: jest.Mocked<ISessionRepository>;
  let mockHistoryRepo: jest.Mocked<IAssignmentHistoryRepository>;

  beforeEach(() => {
    mockAssignmentRepo = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findBySessionId: jest.fn(),
      findByCandidateId: jest.fn(),
      findActiveByCandidateAndSession: jest.fn(),
      findActiveBySeatAndSession: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ISeatAssignmentRepository>;

    mockCandidateRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ICandidateRepository>;

    mockSeatRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<ISeatRepository>;

    mockSessionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ISessionRepository>;

    mockHistoryRepo = {
      create: jest.fn(),
      createMany: jest.fn(),
      findWithPagination: jest.fn(),
      findByCandidateId: jest.fn(),
    } as unknown as jest.Mocked<IAssignmentHistoryRepository>;

    seatAssignmentService = new SeatAssignmentService(
      mockAssignmentRepo,
      mockCandidateRepo,
      mockSeatRepo,
      mockSessionRepo,
      mockHistoryRepo
    );

    
    jest.spyOn(mongoose, 'startSession').mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully assign a seat and create history in a transaction', async () => {
    mockSessionRepo.findById.mockResolvedValue({ _id: 'session1', sessionNumber: 1, examId: 'exam1' } as any);
    mockCandidateRepo.findById.mockResolvedValue({ _id: 'cand1', sessionId: 'session1' } as any);
    mockSeatRepo.findById.mockResolvedValue({ _id: 'seat1', status: 'ACTIVE', seatNumber: 'A1' } as any);
    mockAssignmentRepo.findActiveByCandidateAndSession.mockResolvedValue(null);
    mockAssignmentRepo.findActiveBySeatAndSession.mockResolvedValue(null);

    mockAssignmentRepo.create.mockResolvedValue({ _id: 'assign1' } as any);
    mockHistoryRepo.create.mockResolvedValue({ _id: 'hist1' } as any);

    const result = await seatAssignmentService.assignSeat({
      candidateId: 'cand1',
      sessionId: 'session1',
      seatId: 'seat1',
      adminId: 'admin1'
    });

    expect(result).toBeDefined();
    expect(mockAssignmentRepo.create).toHaveBeenCalledTimes(1);
    expect(mockHistoryRepo.create).toHaveBeenCalledTimes(1);
  });

  it('should abort transaction and rollback if history creation fails', async () => {
    mockSessionRepo.findById.mockResolvedValue({ _id: 'session1', sessionNumber: 1, examId: 'exam1' } as any);
    mockCandidateRepo.findById.mockResolvedValue({ _id: 'cand1', sessionId: 'session1' } as any);
    mockSeatRepo.findById.mockResolvedValue({ _id: 'seat1', status: 'ACTIVE', seatNumber: 'A1' } as any);
    mockAssignmentRepo.findActiveByCandidateAndSession.mockResolvedValue(null);
    mockAssignmentRepo.findActiveBySeatAndSession.mockResolvedValue(null);

    mockAssignmentRepo.create.mockResolvedValue({ _id: 'assign1' } as any);
    mockHistoryRepo.create.mockRejectedValue(new Error('DB failure'));

    await expect(
      seatAssignmentService.assignSeat({
        candidateId: 'cand1',
        sessionId: 'session1',
        seatId: 'seat1',
        adminId: 'admin1'
      })
    ).rejects.toThrow('DB failure');

    const session = await mongoose.startSession();
    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it('should prevent concurrency when a candidate or seat is already assigned', async () => {
    mockSessionRepo.findById.mockResolvedValue({ _id: 'session1', sessionNumber: 1, examId: 'exam1' } as any);
    mockCandidateRepo.findById.mockResolvedValue({ _id: 'cand1', sessionId: 'session1' } as any);
    mockSeatRepo.findById.mockResolvedValue({ _id: 'seat1', status: 'ACTIVE', seatNumber: 'A1' } as any);
    
    
    mockAssignmentRepo.findActiveByCandidateAndSession.mockResolvedValue(null);
    mockAssignmentRepo.findActiveBySeatAndSession.mockResolvedValue({ _id: 'existingAssign' } as any);

    await expect(
      seatAssignmentService.assignSeat({
        candidateId: 'cand1',
        sessionId: 'session1',
        seatId: 'seat1',
        adminId: 'admin1'
      })
    ).rejects.toThrow(ConflictError);
  });
});
