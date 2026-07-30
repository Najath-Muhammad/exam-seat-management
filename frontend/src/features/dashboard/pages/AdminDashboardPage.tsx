import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/dashboardApi';
import { IDashboardData, IHistoryResponse, HistoryAction, IAssignmentHistory } from '../types/dashboard.types';
import { useSocket } from '../../../context/SocketContext';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [history, setHistory] = useState<IHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examId] = useState('');
  const [sessionId] = useState('');
  const { socket, isConnected } = useSocket();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, historyData] = await Promise.all([
        dashboardApi.getOverview(examId, sessionId),
        dashboardApi.getHistory(1, 20, { examId, sessionId })
      ]);
      setData(overviewData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [examId, sessionId]);

  useEffect(() => {
    if (!socket) return;
    
    const onUpdate = () => {
      console.log('Socket Update Received, refetching dashboard data...');
      fetchData();
    };

    socket.on('SEAT_ASSIGNED', onUpdate);
    socket.on('SEAT_REASSIGNED', onUpdate);
    socket.on('CANDIDATE_MOVED', onUpdate);
    socket.on('ASSIGNMENT_CANCELLED', onUpdate);
    socket.on('AUTO_ASSIGNED', onUpdate);

    return () => {
      socket.off('SEAT_ASSIGNED', onUpdate);
      socket.off('SEAT_REASSIGNED', onUpdate);
      socket.off('CANDIDATE_MOVED', onUpdate);
      socket.off('ASSIGNMENT_CANCELLED', onUpdate);
      socket.off('AUTO_ASSIGNED', onUpdate);
    };
  }, [socket]);

  if (loading && !data) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!data) return <div>No data available</div>;

  return (
  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <span style={{ 
            fontSize: '0.8rem', 
            padding: '4px 12px', 
            borderRadius: '9999px', 
            backgroundColor: isConnected ? '#d1fae5' : '#fee2e2',
            color: isConnected ? '#059669' : '#dc2626',
            fontWeight: 500
          }}>
            {isConnected ? '● Live' : '○ Offline'}
          </span>
        </div>
        <div>
          <button onClick={fetchData} className="btn-primary">
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid-cards">
        <div className="dashboard-card">
          <h4>Total Exams</h4>
          <h2 style={{ color: 'var(--primary)' }}>{data.overview.totalExams}</h2>
        </div>
        <div className="dashboard-card">
          <h4>Total Sessions</h4>
          <h2 style={{ color: 'var(--primary)' }}>{data.overview.totalSessions}</h2>
        </div>
        <div className="dashboard-card">
          <h4>Assigned Candidates</h4>
          <h2 style={{ color: '#059669' }}>{data.candidates.assigned}</h2>
          <small className="text-muted">{data.candidates.unassigned} Unassigned</small>
        </div>
        <div className="dashboard-card">
          <h4>Occupied Seats</h4>
          <h2 style={{ color: 'var(--secondary)' }}>{data.seats.occupied}</h2>
          <small className="text-muted">{data.seats.vacant} Vacant</small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Recent Movements & Activity</h3>
          {data.activity.length === 0 ? (
            <p className="text-muted">No recent activity</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.activity.map((act, idx) => (
                <div key={idx} style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <strong>{act.candidateName} <span className="text-muted">({act.registrationNumber})</span></strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: 
                        act.action === HistoryAction.SESSION_MOVED ? '#fef3c7' :
                        act.action === HistoryAction.SEAT_REASSIGNED ? '#e0f2fe' :
                        act.action === HistoryAction.INITIAL_ASSIGNMENT ? '#d1fae5' : '#fee2e2',
                      color: 
                        act.action === HistoryAction.SESSION_MOVED ? '#d97706' :
                        act.action === HistoryAction.SEAT_REASSIGNED ? '#0284c7' :
                        act.action === HistoryAction.INITIAL_ASSIGNMENT ? '#059669' : '#dc2626'
                    }}>
                      {act.action.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '8px' }}>
                    {act.oldSessionName && act.newSessionName && act.oldSessionName !== act.newSessionName && (
                      <div>Session: {act.oldSessionName} &rarr; {act.newSessionName}</div>
                    )}
                    {act.oldSeatNumber && act.newSeatNumber && (
                      <div>Seat: {act.oldSeatNumber} &rarr; {act.newSeatNumber}</div>
                    )}
                    {!act.oldSeatNumber && act.newSeatNumber && (
                      <div>Seat: {act.newSeatNumber}</div>
                    )}
                  </div>
                  {act.reason && <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '8px', color: 'var(--text-muted)' }}>Reason: {act.reason}</div>}
                  <div style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-muted)' }}>By: {act.performedBy}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>System Status</h3>
            <div style={{ padding: '1.5rem', backgroundColor: data.system.issueCount === 0 ? '#d1fae5' : '#fee2e2', borderRadius: '12px', border: '1px solid', borderColor: data.system.issueCount === 0 ? '#34d399' : '#f87171' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Database:</strong> {data.system.database}</p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Consistency:</strong> {data.system.consistencyStatus}</p>
              <p style={{ margin: 0 }}><strong>Issues Detected:</strong> <span style={{ color: data.system.issueCount === 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>{data.system.issueCount}</span></p>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Complete Assignment History</h3>
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Candidate</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {history?.data.map((h: IAssignmentHistory) => (
                  <tr key={h._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{new Date(h.createdAt).toLocaleDateString()}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(h.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{h.candidateId.name}</div>
                      <small className="text-muted">{h.candidateId.registrationNumber}</small>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: 'var(--text-main)'
                      }}>
                        {h.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {h.oldSessionId && h.newSessionId && h.oldSessionId._id !== h.newSessionId._id && (
                        <div>Session: {h.oldSessionId.name} &rarr; {h.newSessionId.name}</div>
                      )}
                      {h.oldSeatId && h.newSeatId && (
                        <div>Seat: {h.oldSeatId.seatNumber} &rarr; {h.newSeatId.seatNumber}</div>
                      )}
                      {!h.oldSeatId && h.newSeatId && (
                        <div>Seat: {h.newSeatId.seatNumber}</div>
                      )}
                      {h.reason && <div className="text-muted" style={{ fontStyle: 'italic', marginTop: '4px' }}>"{h.reason}"</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
