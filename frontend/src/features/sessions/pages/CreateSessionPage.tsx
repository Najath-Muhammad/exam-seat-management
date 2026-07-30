import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionApi } from '../services/sessionApi';

export const CreateSessionPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const [sessionNumber, setSessionNumber] = useState('');
  const [name, setName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await sessionApi.createSession(examId, {
        sessionNumber: parseInt(sessionNumber, 10),
        name,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      });
      navigate(`/admin/exams/${examId}/sessions`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Create New Session</h2>
        <Link to={`/admin/exams/${examId}/sessions`} className="btn-secondary" style={{ textDecoration: 'none', border: '1px solid var(--border)', padding: '0.6rem 1.2rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
          &larr; Back to Sessions
        </Link>
      </div>
      
      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="form-group">
            <label>Session Number</label>
            <input 
              type="number" 
              value={sessionNumber} 
              onChange={(e) => setSessionNumber(e.target.value)} 
              required 
              min="1"
            />
          </div>
          
          <div className="form-group">
            <label>Session Name (Optional)</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Morning Session"
            />
          </div>

          <div className="form-group">
            <label>Start Date & Time</label>
            <input 
              type="datetime-local" 
              value={startAt} 
              onChange={(e) => setStartAt(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>End Date & Time</label>
            <input 
              type="datetime-local" 
              value={endAt} 
              onChange={(e) => setEndAt(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="full-width mt-4"
          >
            {isSubmitting ? 'Creating...' : 'Create Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
