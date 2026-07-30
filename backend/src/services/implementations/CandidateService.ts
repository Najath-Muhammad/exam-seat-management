import { ICandidateService, ICreateCandidateDTO, IUpdateCandidateDTO } from '../interfaces/ICandidateService';
import { ICandidateRepository } from '../../repositories/interfaces/ICandidateRepository';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { ICandidate } from '../../models/Candidate';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors';
import { CandidateStatus } from '../../types/candidate.types';
import { Types } from 'mongoose';import { TAny } from '../../types/any';


export class CandidateService implements ICandidateService {
  constructor(
    private readonly candidateRepository: ICandidateRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  async createCandidate(data: ICreateCandidateDTO): Promise<ICandidate> {
    const session = await this.sessionRepository.findById(data.sessionId);
    if (!session) throw new NotFoundError('Session not found');

    if (session.isCandidatesFinalized) {
      throw new BadRequestError('Cannot add candidate. Session candidate list is finalized.');
    }

    const currentCount = await this.candidateRepository.countBySessionId(data.sessionId);
    if (currentCount >= session.capacity) {
      throw new ConflictError('Session capacity exceeded');
    }

    const exists = await this.candidateRepository.existsByRegistrationNumber(data.registrationNumber);
    if (exists) {
      throw new ConflictError(`Registration number ${data.registrationNumber} already exists`);
    }

    return this.candidateRepository.create({
      ...data,
      sessionId: new Types.ObjectId(data.sessionId) as TAny,
      status: CandidateStatus.REGISTERED
    });
  }

  async getCandidatesBySession(sessionId: string, skip: number = 0, limit: number = 50): Promise<{ candidates: ICandidate[], total: number }> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');
    return this.candidateRepository.findBySessionId(sessionId, skip, limit);
  }

  async getCandidateById(candidateId: string): Promise<ICandidate> {
    const candidate = await this.candidateRepository.findById(candidateId);
    if (!candidate) throw new NotFoundError('Candidate not found');
    return candidate;
  }

  async updateCandidate(candidateId: string, data: IUpdateCandidateDTO): Promise<ICandidate> {
    const candidate = await this.candidateRepository.findById(candidateId);
    if (!candidate) throw new NotFoundError('Candidate not found');

    const updatePayload = { ...data } as Partial<ICandidate>;
    if (data.status) {
      updatePayload.status = data.status as CandidateStatus;
    }

    const updated = await this.candidateRepository.update(candidateId, updatePayload);
    return updated!;
  }

  async deleteCandidate(candidateId: string): Promise<void> {
    const candidate = await this.candidateRepository.findById(candidateId);
    if (!candidate) throw new NotFoundError('Candidate not found');

    const session = await this.sessionRepository.findById(candidate.sessionId.toString());
    if (session && session.isCandidatesFinalized) {
      throw new BadRequestError('Cannot delete candidate. Session candidate list is finalized.');
    }

    await this.candidateRepository.delete(candidateId);
  }

  async bulkImport(sessionId: string, candidates: Omit<ICreateCandidateDTO, 'sessionId'>[]): Promise<{ imported: number; failed: number; errors: TAny[] }> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');

    if (session.isCandidatesFinalized) {
      throw new BadRequestError('Cannot import candidates. Session candidate list is finalized.');
    }

    const currentCount = await this.candidateRepository.countBySessionId(sessionId);
    if (currentCount + candidates.length > session.capacity) {
      throw new ConflictError(`Importing ${candidates.length} candidates would exceed session capacity of ${session.capacity}. Currently ${currentCount} assigned.`);
    }

    let imported = 0;
    let failed = 0;
    const errors: TAny[] = [];

    
    
    const allRegNums = candidates.map(c => c.registrationNumber);
    const uniqueRegNums = new Set(allRegNums);
    
    if (uniqueRegNums.size !== allRegNums.length) {
      throw new BadRequestError('CSV contains duplicate registration numbers within itself');
    }

    const validCandidatesToInsert = [];

    for (let i = 0; i < candidates.length; i++) {
      const row = candidates[i];
      try {
        const exists = await this.candidateRepository.existsByRegistrationNumber(row.registrationNumber);
        if (exists) {
          failed++;
          errors.push({ row: i + 1, registrationNumber: row.registrationNumber, error: 'Registration number already exists in database' });
          continue;
        }

        validCandidatesToInsert.push({
          ...row,
          sessionId: new Types.ObjectId(sessionId) as TAny,
          status: CandidateStatus.REGISTERED
        });
      } catch (err: TAny) {
        failed++;
        errors.push({ row: i + 1, registrationNumber: row.registrationNumber, error: err.message });
      }
    }

    if (validCandidatesToInsert.length > 0) {
      await this.candidateRepository.createMany(validCandidatesToInsert);
      imported = validCandidatesToInsert.length;
    }

    return { imported, failed, errors };
  }
}
