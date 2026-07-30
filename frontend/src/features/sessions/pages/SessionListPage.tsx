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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Sessions for {exam.name}</h2>
        <Link 
          to={`/admin/exams/${exam._id}/sessions/create`}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
        >
          + Create Session
        </Link>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        {sessions.length === 0 ? (
          <p>No sessions created yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem' }}>Session</th>
                <th style={{ padding: '0.5rem' }}>Time</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>
                    {s.name || `Session ${s.sessionNumber}`}
                    <br />
                    <small>#{s.sessionNumber}</small>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(s.startAt).toLocaleString()} - <br/>{new Date(s.endAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <Link to={`/admin/sessions/${s._id}`} style={{ marginRight: '1rem', color: '#007bff' }}>Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
