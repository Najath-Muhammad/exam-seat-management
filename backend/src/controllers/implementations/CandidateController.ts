import { sendResponse } from '../../utils/response.util';
import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { ICandidateController } from '../interfaces/ICandidateController';
import { ICandidateService } from '../../services/interfaces/ICandidateService';
import { HttpStatus } from '../../constants/statusCodes';
import { parse } from 'csv-parse';
import fs from 'fs';

export class CandidateController implements ICandidateController {
  constructor(private readonly candidateService: ICandidateService) {}

  async createCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const candidate = await this.candidateService.createCandidate({
        sessionId,
        ...req.body
      });
      sendResponse(res, HttpStatus.CREATED, AppMessages.CANDIDATE_CREATED, candidate);
    } catch (error) {
      next(error);
    }
  }

  async getCandidatesBySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const result = await this.candidateService.getCandidatesBySession(sessionId, skip, limit);
      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATES_RETRIEVED, {
          candidates: result.candidates,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        });
    } catch (error) {
      next(error);
    }
  }

  async getCandidateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      const candidate = await this.candidateService.getCandidateById(candidateId);
      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATE_RETRIEVED, candidate);
    } catch (error) {
      next(error);
    }
  }

  async updateCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      const candidate = await this.candidateService.updateCandidate(candidateId, req.body);
      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATE_UPDATED, candidate);
    } catch (error) {
      next(error);
    }
  }

  async deleteCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      await this.candidateService.deleteCandidate(candidateId);
      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATE_DELETED);
    } catch (error) {
      next(error);
    }
  }

  async bulkImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      if (!req.file) {
        sendResponse(res, HttpStatus.BAD_REQUEST, AppMessages.CSV_FILE_REQUIRED);
        return;
      }

      const records: any[] = [];
      const parser = fs.createReadStream(req.file.path).pipe(parse({ columns: true, skip_empty_lines: true }));

      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on('error', (err) => {
        fs.unlinkSync(req.file!.path);
        next(err);
      });

      parser.on('end', async () => {
        
        fs.unlinkSync(req.file!.path);

        try {
          
          const mappedRecords = records.map(row => ({
            registrationNumber: row.registrationNumber || row.RegistrationNumber || row['Registration Number'],
            name: row.name || row.Name,
            email: row.email || row.Email,
            phone: row.phone || row.Phone,
          }));

          
          if (mappedRecords.some(r => !r.registrationNumber || !r.name)) {
            sendResponse(res, HttpStatus.BAD_REQUEST, AppMessages.CSV_COLUMNS_REQUIRED);
            return;
          }

          const result = await this.candidateService.bulkImport(sessionId, mappedRecords);
          sendResponse(res, HttpStatus.OK, AppMessages.BULK_IMPORT_PROCESSED, result);
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
}
