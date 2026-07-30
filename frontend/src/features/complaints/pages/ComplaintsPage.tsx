import { TAny } from '../../../types/any';
import React, { useEffect, useState } from 'react';
import { complaintApi, Complaint } from '../services/complaintApi';
import { sessionApi } from '../../sessions/services/sessionApi';
import { candidateApi } from '../../candidates/services/candidateApi';
import { Exam, Session } from '../../sessions/types/session.types';
import { Candidate } from '../../candidates/types/candidate.types';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: '#fef3c7', color: '#92400e' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af' },
  RESOLVED:    { bg: '#d1fae5', color: '#065f46' },
  REJECTED:    { bg: '#fee2e2', color: '#991b1b' },
};

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  
  const [resolveModal, setResolveModal] = useState<{ id: string; status: string; remarks: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [registerForm, setRegisterForm] = useState({ examId: '', sessionId: '', candidateId: '', description: '' });
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await complaintApi.getAllComplaints();
      setComplaints(data);
      setError(null);
    } catch (err: TAny) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  
  const openRegisterModal = async () => {
    try {
      const data = await sessionApi.getExams();
      setExams(data);
    } catch (_e) { void _e; }
    setRegisterForm({ examId: '', sessionId: '', candidateId: '', description: '' });
    setSessions([]);
    setCandidates([]);
    setShowRegisterModal(true);
  };

  const handleExamChange = async (examId: string) => {
    setRegisterForm(f => ({ ...f, examId, sessionId: '', candidateId: '' }));
    setSessions([]); setCandidates([]);
    if (!examId) return;
    setIsLoadingSessions(true);
    try {
      const data = await sessionApi.getSessions(examId);
      setSessions(data);
    } catch (_e) { void _e; } finally { setIsLoadingSessions(false); }
  };

  const handleSessionChange = async (sessionId: string) => {
    setRegisterForm(f => ({ ...f, sessionId, candidateId: '' }));
    setCandidates([]);
    if (!sessionId) return;
    setIsLoadingCandidates(true);
    try {
      const result = await candidateApi.getCandidatesBySession(sessionId, 1, 200);
      setCandidates(result.candidates);
    } catch (_e) { void _e; } finally { setIsLoadingCandidates(false); }
  };

  const handleRegisterComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.candidateId || !registerForm.sessionId || !registerForm.description) return;
    setIsRegistering(true);
    try {
      await complaintApi.registerComplaint(registerForm.candidateId, registerForm.sessionId, registerForm.description);
      setShowRegisterModal(false);
      await fetchComplaints();
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to register complaint');
    } finally { setIsRegistering(false); }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModal) return;
    setIsSaving(true);
    try {
      await complaintApi.updateComplaintStatus(resolveModal.id, resolveModal.status, resolveModal.remarks);
      await fetchComplaints();
      setResolveModal(null);
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = filterStatus
    ? complaints.filter(c => c.status === filterStatus)
    : complaints;

  const getCandidateName = (c: Complaint) => {
    if (!c.candidateId) return 'N/A';
    if (typeof c.candidateId === 'object') return `${c.candidateId.name} (${c.candidateId.registrationNumber})`;
    return c.candidateId;
  };

  const getSessionName = (c: Complaint) => {
    if (!c.sessionId) return 'N/A';
    if (typeof c.sessionId === 'object') return c.sessionId.name || `Session ${c.sessionId.sessionNumber}`;
    return c.sessionId;
  };

  const counts = {
    PENDING:     complaints.filter(c => c.status === 'PENDING').length,
    IN_PROGRESS: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    RESOLVED:    complaints.filter(c => c.status === 'RESOLVED').length,
    REJECTED:    complaints.filter(c => c.status === 'REJECTED').length,
  };

  if (isLoading) return <div className="page-container"><p>Loading complaints...</p></div>;
  if (error) return <div className="page-container"><div className="alert-error">{error}</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 style={{ margin: 0 }}>Complaints</h2>
          <p className="text-muted" style={{ margin: '0.25rem 0 0' }}>Manage and resolve candidate complaints</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={openRegisterModal} style={{ backgroundColor: 'var(--primary)' }}>+ Register Complaint</button>
          <button onClick={fetchComplaints} style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>↻ Refresh</button>
        </div>
      </div>

      {}
      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        {Object.entries(counts).map(([status, count]) => (
          <div
            key={status}
            className="dashboard-card"
            style={{ cursor: 'pointer', borderLeft: `4px solid ${STATUS_COLORS[status].color}`, opacity: filterStatus && filterStatus !== status ? 0.5 : 1 }}
            onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
          >
            <h4>{status.replace('_', ' ')}</h4>
            <h2 style={{ color: STATUS_COLORS[status].color }}>{count}</h2>
          </div>
        ))}
      </div>

      {}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '200px' }}>
          <option value="">All Statuses ({complaints.length})</option>
          <option value="PENDING">Pending ({counts.PENDING})</option>
          <option value="IN_PROGRESS">In Progress ({counts.IN_PROGRESS})</option>
          <option value="RESOLVED">Resolved ({counts.RESOLVED})</option>
          <option value="REJECTED">Rejected ({counts.REJECTED})</option>
        </select>
        {filterStatus && (
          <button onClick={() => setFilterStatus('')} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Clear Filter
          </button>
        )}
      </div>

      {}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>No complaints found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Session</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{getCandidateName(c)}</td>
                    <td>{getSessionName(c)}</td>
                    <td style={{ maxWidth: '250px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <span title={c.description}>
                        {c.description.length > 80 ? c.description.slice(0, 80) + '…' : c.description}
                      </span>
                      {c.resolutionRemarks && (
                        <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: 'var(--secondary)', fontStyle: 'italic' }}>
                          Remarks: {c.resolutionRemarks}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: STATUS_COLORS[c.status]?.bg || '#f1f5f9',
                        color: STATUS_COLORS[c.status]?.color || 'var(--text-main)',
                      }}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                    <td>
                      {c.status !== 'RESOLVED' && c.status !== 'REJECTED' && (
                        <button
                          onClick={() => setResolveModal({ id: c._id, status: c.status, remarks: c.resolutionRemarks || '' })}
                          style={{ padding: '0.35rem 0.75rem', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.85rem' }}
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      {resolveModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', minWidth: '440px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ margin: '0 0 1.5rem' }}>Update Complaint Status</h3>
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label>Status</label>
                <select value={resolveModal.status} onChange={e => setResolveModal({ ...resolveModal, status: e.target.value })}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Resolution Remarks (optional)</label>
                <textarea
                  value={resolveModal.remarks}
                  onChange={e => setResolveModal({ ...resolveModal, remarks: e.target.value })}
                  placeholder="e.g. Seat was reassigned and issue resolved."
                  style={{ width: '100%', minHeight: '80px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setResolveModal(null)}
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', minWidth: '480px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ margin: '0 0 1.5rem' }}>Register New Complaint</h3>
            <form onSubmit={handleRegisterComplaint}>
              <div className="form-group">
                <label>Exam</label>
                <select value={registerForm.examId} onChange={e => handleExamChange(e.target.value)} required>
                  <option value="">Select an exam...</option>
                  {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Session</label>
                <select value={registerForm.sessionId} onChange={e => handleSessionChange(e.target.value)} required disabled={!registerForm.examId || isLoadingSessions}>
                  <option value="">{isLoadingSessions ? 'Loading...' : 'Select a session...'}</option>
                  {sessions.map(s => <option key={s._id} value={s._id}>{s.name || `Session ${s.sessionNumber}`}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Candidate</label>
                <select value={registerForm.candidateId} onChange={e => setRegisterForm(f => ({ ...f, candidateId: e.target.value }))} required disabled={!registerForm.sessionId || isLoadingCandidates}>
                  <option value="">{isLoadingCandidates ? 'Loading...' : 'Select a candidate...'}</option>
                  {candidates.map(c => <option key={c._id} value={c._id}>{c.registrationNumber} — {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Complaint Description</label>
                <textarea
                  value={registerForm.description}
                  onChange={e => setRegisterForm(f => ({ ...f, description: e.target.value }))}
                  required
                  placeholder="Describe the issue the candidate is facing..."
                  style={{ width: '100%', minHeight: '90px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" disabled={isRegistering}>
                  {isRegistering ? 'Submitting...' : 'Submit Complaint'}
                </button>
                <button type="button" onClick={() => setShowRegisterModal(false)}
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
