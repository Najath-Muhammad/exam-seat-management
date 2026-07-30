import { UserRepository } from '../repositories/implementations/UserRepository';
import { AuthService } from '../services/implementations/AuthService';
import { AuthController } from '../controllers/implementations/AuthController';

import { SessionRepository } from '../repositories/implementations/SessionRepository';
import { SessionService } from '../services/implementations/SessionService';
import { SessionController } from '../controllers/implementations/SessionController';

import { CandidateRepository } from '../repositories/implementations/CandidateRepository';
import { CandidateService } from '../services/implementations/CandidateService';
import { CandidateController } from '../controllers/implementations/CandidateController';

import { SeatRepository } from '../repositories/implementations/SeatRepository';
import { SeatService } from '../services/implementations/SeatService';
import { SeatController } from '../controllers/implementations/SeatController';

import { SeatAssignmentRepository } from '../repositories/implementations/SeatAssignmentRepository';
import { SeatAssignmentService } from '../services/implementations/SeatAssignmentService';
import { SeatAssignmentController } from '../controllers/implementations/SeatAssignmentController';

import { InitialAllocationService } from '../services/implementations/InitialAllocationService';
import { InitialAllocationController } from '../controllers/implementations/InitialAllocationController';

import { SeatMapService } from '../services/implementations/SeatMapService';
import { SeatMapController } from '../controllers/implementations/SeatMapController';

import { AssignmentHistoryRepository } from '../repositories/implementations/AssignmentHistoryRepository';
import { AssignmentHistoryService } from '../services/implementations/AssignmentHistoryService';
import { AssignmentHistoryController } from '../controllers/implementations/AssignmentHistoryController';

import { DashboardService } from '../services/implementations/DashboardService';
import { DashboardController } from '../controllers/implementations/DashboardController';

import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAuthService } from '../services/interfaces/IAuthService';
import { IAuthController } from '../controllers/interfaces/IAuthController';

import { ISessionRepository } from '../repositories/interfaces/ISessionRepository';
import { ISessionService } from '../services/interfaces/ISessionService';
import { ISessionController } from '../controllers/interfaces/ISessionController';

import { ICandidateRepository } from '../repositories/interfaces/ICandidateRepository';
import { ICandidateService } from '../services/interfaces/ICandidateService';
import { ICandidateController } from '../controllers/interfaces/ICandidateController';

import { ISeatRepository } from '../repositories/interfaces/ISeatRepository';
import { ISeatService } from '../services/interfaces/ISeatService';
import { ISeatController } from '../controllers/interfaces/ISeatController';

import { ISeatAssignmentRepository } from '../repositories/interfaces/ISeatAssignmentRepository';
import { ISeatAssignmentService } from '../services/interfaces/ISeatAssignmentService';
import { ISeatAssignmentController } from '../controllers/interfaces/ISeatAssignmentController';

import { IInitialAllocationService } from '../services/interfaces/IInitialAllocationService';
import { IInitialAllocationController } from '../controllers/interfaces/IInitialAllocationController';

import { ISeatMapService } from '../services/interfaces/ISeatMapService';
import { ISeatMapController } from '../controllers/interfaces/ISeatMapController';

import { IAssignmentHistoryRepository } from '../repositories/interfaces/IAssignmentHistoryRepository';
import { IAssignmentHistoryService } from '../services/interfaces/IAssignmentHistoryService';
import { IAssignmentHistoryController } from '../controllers/interfaces/IAssignmentHistoryController';

import { IDashboardService } from '../services/interfaces/IDashboardService';
import { IDashboardController } from '../controllers/interfaces/IDashboardController';

const userRepository: IUserRepository = new UserRepository();
const sessionRepository: ISessionRepository = new SessionRepository();
const candidateRepository: ICandidateRepository = new CandidateRepository();
const seatRepository: ISeatRepository = new SeatRepository();
const seatAssignmentRepository: ISeatAssignmentRepository = new SeatAssignmentRepository();
const assignmentHistoryRepository: IAssignmentHistoryRepository = new AssignmentHistoryRepository();

const authService: IAuthService = new AuthService(userRepository);
const sessionService: ISessionService = new SessionService(sessionRepository);
const candidateService: ICandidateService = new CandidateService(candidateRepository, sessionRepository);
const seatService: ISeatService = new SeatService(seatRepository);
const assignmentHistoryService: IAssignmentHistoryService = new AssignmentHistoryService(assignmentHistoryRepository);

const seatAssignmentService: ISeatAssignmentService = new SeatAssignmentService(
  seatAssignmentRepository,
  candidateRepository,
  seatRepository,
  sessionRepository,
  assignmentHistoryRepository
);
const initialAllocationService: IInitialAllocationService = new InitialAllocationService(
  seatAssignmentRepository,
  candidateRepository,
  seatRepository,
  sessionRepository
);
const seatMapService: ISeatMapService = new SeatMapService(
  seatAssignmentRepository,
  candidateRepository,
  seatRepository,
  sessionRepository
);
const dashboardService: IDashboardService = new DashboardService(
  seatRepository,
  seatAssignmentRepository,
  assignmentHistoryRepository
);

const authController: IAuthController = new AuthController(authService);
const sessionController: ISessionController = new SessionController(sessionService);
const candidateController: ICandidateController = new CandidateController(candidateService);
const seatController: ISeatController = new SeatController(seatService);
const seatAssignmentController: ISeatAssignmentController = new SeatAssignmentController(seatAssignmentService);
const initialAllocationController: IInitialAllocationController = new InitialAllocationController(initialAllocationService);
const seatMapController: ISeatMapController = new SeatMapController(seatMapService);
const assignmentHistoryController: IAssignmentHistoryController = new AssignmentHistoryController(assignmentHistoryService);
const dashboardController: IDashboardController = new DashboardController(dashboardService);

export const container = {
  authController,
  sessionController,
  candidateController,
  seatController,
  seatAssignmentController,
  initialAllocationController,
  seatMapController,
  assignmentHistoryController,
  dashboardController
};
