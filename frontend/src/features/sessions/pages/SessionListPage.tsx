import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Session, Exam } from '../types/session.types';
import { sessionApi } from '../services/sessionApi';

export const SessionListPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    const fetchData = async () => {
      try {
        const [examData, sessionsData] = await Promise.all([
          sessionApi.getExam(examId),
          sessionApi.getSessions(examId)
        ]);
        setExam(examData);
        setSessions(sessionsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  if (isLoading) return <div>Loading sessions...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!exam) return <div>Exam not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Sessions for {exam.name}</h2>
        <Link 
          to={`/admin/exams/${exam._id}/sessions/create`}
          className="btn-primary"
          style={{ textDecoration: 'none', backgroundColor: 'var(--primary)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 500 }}
        >
          + Create Session
        </Link>
      </div>
      
      <div className="card">
        {sessions.length === 0 ? (
          <p className="text-muted">No sessions created yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name || `Session ${s.sessionNumber}`}</div>
                      <small className="text-muted">#{s.sessionNumber}</small>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>{new Date(s.startAt).toLocaleString()}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{new Date(s.endAt).toLocaleString()}</div>
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
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/sessions/${s._id}`} style={{ fontWeight: 500 }}>Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
