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
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: AppMessages.CANDIDATE_CREATED,
        data: candidate
      });
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
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.CANDIDATES_RETRIEVED,
        data: {
          candidates: result.candidates,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCandidateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      const candidate = await this.candidateService.getCandidateById(candidateId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.CANDIDATE_RETRIEVED,
        data: candidate
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      const candidate = await this.candidateService.updateCandidate(candidateId, req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.CANDIDATE_UPDATED,
        data: candidate
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      await this.candidateService.deleteCandidate(candidateId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.CANDIDATE_DELETED
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      if (!req.file) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: AppMessages.CSV_FILE_REQUIRED });
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
        // Clean up uploaded file
        fs.unlinkSync(req.file!.path);

        try {
          // Normalize row headers to camelCase and validate
          const mappedRecords = records.map(row => ({
            registrationNumber: row.registrationNumber || row.RegistrationNumber || row['Registration Number'],
            name: row.name || row.Name,
            email: row.email || row.Email,
            phone: row.phone || row.Phone,
          }));

          // Validate minimum fields
          if (mappedRecords.some(r => !r.registrationNumber || !r.name)) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: AppMessages.CSV_COLUMNS_REQUIRED });
            return;
          }

          const result = await this.candidateService.bulkImport(sessionId, mappedRecords);
          res.status(HttpStatus.OK).json({
            success: true,
            message: AppMessages.BULK_IMPORT_PROCESSED,
            data: result
          });
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
