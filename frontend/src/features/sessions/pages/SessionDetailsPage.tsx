import { TAny } from '../../../types/any';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Session } from '../types/session.types';
import { sessionApi } from '../services/sessionApi';

export const SessionDetailsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const data = await sessionApi.getSession(sessionId);
        setSession(data);
      } catch (err: TAny) {
        setError(err.response?.data?.message || 'Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleDelete = async () => {
    if (!session) return;
    if (window.confirm('Are you sure you want to delete this session?')) {
      setIsDeleting(true);
      try {
        await sessionApi.deleteSession(session._id);
        navigate(`/admin/exams/${session.examId}/sessions`);
      } catch (err: TAny) {
        setError(err.response?.data?.message || 'Failed to delete session');
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) return <div>Loading session details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!session) return <div>Session not found.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link to={`/admin/exams/${session.examId}/sessions`} style={{ color: '#6c757d', textDecoration: 'none' }}>
          &larr; Back to Sessions
        </Link>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isDeleting ? 'Deleting...' : 'Delete Session'}
        </button>
      </div>

      <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Session Details</h2>
        <table style={{ width: '100%', textAlign: 'left', marginTop: '1.5rem', lineHeight: '2' }}>
          <tbody>
            <tr>
              <th style={{ width: '150px' }}>Session Name</th>
              <td>{session.name || 'N/A'}</td>
            </tr>
            <tr>
              <th>Session Number</th>
              <td>#{session.sessionNumber}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td><strong>{session.status}</strong></td>
            </tr>
            <tr>
              <th>Start Time</th>
              <td>{new Date(session.startAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th>End Time</th>
              <td>{new Date(session.endAt).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Created At</th>
              <td>{new Date(session.createdAt).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Candidates</h4>
            <Link 
              to={`/admin/exams/${session.examId}/sessions/${session._id}/candidates`} 
              style={{ padding: '0.25rem 0.75rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem' }}
            >
              Manage Candidates
            </Link>
          </div>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>{session.isCandidatesFinalized ? 'List is finalized' : 'List is editable'}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <h4>Seat Assignments</h4>
            <Link 
              to={`/admin/exams/${session.examId}/sessions/${session._id}/assignments`} 
              style={{ padding: '0.25rem 0.75rem', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem' }}
            >
              Manage Seat Assignments
            </Link>
          </div>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>View map, auto-assign, and manage current seats.</p>
        </div>
      </div>
    </div>
  );
};
