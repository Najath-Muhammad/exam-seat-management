import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { UserRole } from '../features/auth/types/auth.types';

import { ExamListPage } from '../features/sessions/pages/ExamListPage';
import { SessionListPage } from '../features/sessions/pages/SessionListPage';
import { CreateSessionPage } from '../features/sessions/pages/CreateSessionPage';
import { SessionDetailsPage } from '../features/sessions/pages/SessionDetailsPage';

import { CandidateListPage } from '../features/candidates/pages/CandidateListPage';
import { CandidateDetailsPage } from '../features/candidates/pages/CandidateDetailsPage';

import { SeatManagementPage } from '../features/seats/pages/SeatManagementPage';
import { SeatAssignmentPage } from '../features/assignments/pages/SeatAssignmentPage';
import { AdminDashboardPage } from '../features/dashboard/pages/AdminDashboardPage';
import { ComplaintsPage } from '../features/complaints/pages/ComplaintsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="exams" element={<ExamListPage />} />
            <Route path="exams/:examId/sessions" element={<SessionListPage />} />
            <Route path="exams/:examId/sessions/create" element={<CreateSessionPage />} />
            <Route path="sessions/:sessionId" element={<SessionDetailsPage />} />
            <Route path="exams/:examId/sessions/:sessionId/candidates" element={<CandidateListPage />} />
            <Route path="exams/:examId/sessions/:sessionId/assignments" element={<SeatAssignmentPage />} />
            <Route path="candidates/:candidateId" element={<CandidateDetailsPage />} />
            <Route path="seats" element={<SeatManagementPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
          </Route>
        </Route>
      </Route>
      
      <Route path="*" element={<div><h2>404 Not Found</h2></div>} />
    </Routes>
  );
};
