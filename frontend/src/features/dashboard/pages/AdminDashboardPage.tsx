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
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <span style={{ 
            fontSize: '0.8rem', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
            color: isConnected ? '#155724' : '#721c24' 
          }}>
            {isConnected ? '● Live' : '○ Offline'}
          </span>
        </div>
        <div>
          <button onClick={fetchData} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Refresh Data
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h4>Total Exams</h4>
          <h2 style={{ margin: 0, color: '#007bff' }}>{data.overview.totalExams}</h2>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h4>Total Sessions</h4>
          <h2 style={{ margin: 0, color: '#007bff' }}>{data.overview.totalSessions}</h2>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h4>Assigned Candidates</h4>
          <h2 style={{ margin: 0, color: '#28a745' }}>{data.candidates.assigned}</h2>
          <small>{data.candidates.unassigned} Unassigned</small>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h4>Occupied Seats</h4>
          <h2 style={{ margin: 0, color: '#17a2b8' }}>{data.seats.occupied}</h2>
          <small>{data.seats.vacant} Vacant</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Recent Movements & Activity</h3>
          {data.activity.length === 0 ? (
            <p>No recent activity</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.activity.map((act, idx) => (
                <div key={idx} style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>{act.candidateName} ({act.registrationNumber})</strong>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      backgroundColor: 
                        act.action === HistoryAction.SESSION_MOVED ? '#ffc107' :
                        act.action === HistoryAction.SEAT_REASSIGNED ? '#17a2b8' :
                        act.action === HistoryAction.INITIAL_ASSIGNMENT ? '#28a745' : '#dc3545',
                      color: act.action === HistoryAction.SESSION_MOVED ? '#000' : '#fff'
                    }}>
                      {act.action.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
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
                  {act.reason && <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '5px', color: '#555' }}>Reason: {act.reason}</div>}
                  <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#888' }}>By: {act.performedBy}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3>System Status</h3>
            <div style={{ padding: '20px', backgroundColor: data.system.issueCount === 0 ? '#d4edda' : '#f8d7da', borderRadius: '8px' }}>
              <p><strong>Database:</strong> {data.system.database}</p>
              <p><strong>Consistency:</strong> {data.system.consistencyStatus}</p>
              <p><strong>Issues Detected:</strong> {data.system.issueCount}</p>
            </div>
          </div>
          
          <h3>Complete Assignment History</h3>
          <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Date</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Candidate</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Action</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {history?.data.map((h: IAssignmentHistory) => (
                  <tr key={h._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{new Date(h.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      {h.candidateId.name}<br/>
                      <small>{h.candidateId.registrationNumber}</small>
                    </td>
                    <td style={{ padding: '10px' }}>{h.action.replace('_', ' ')}</td>
                    <td style={{ padding: '10px', fontSize: '0.9rem' }}>
                      {h.oldSessionId && h.newSessionId && h.oldSessionId._id !== h.newSessionId._id && (
                        <div>Session: {h.oldSessionId.name} &rarr; {h.newSessionId.name}</div>
                      )}
                      {h.oldSeatId && h.newSeatId && (
                        <div>Seat: {h.oldSeatId.seatNumber} &rarr; {h.newSeatId.seatNumber}</div>
                      )}
                      {!h.oldSeatId && h.newSeatId && (
                        <div>Seat: {h.newSeatId.seatNumber}</div>
                      )}
                      {h.reason && <div style={{ color: '#666', fontStyle: 'italic' }}>"{h.reason}"</div>}
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
