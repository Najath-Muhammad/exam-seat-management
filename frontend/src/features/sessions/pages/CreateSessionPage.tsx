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
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/admin/exams/${examId}/sessions`} style={{ color: '#6c757d', textDecoration: 'none' }}>
          &larr; Back to Sessions
        </Link>
      </div>
      <h2>Create New Session</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', border: '1px solid red', borderRadius: '4px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Session Number</label>
          <input 
            type="number" 
            value={sessionNumber} 
            onChange={(e) => setSessionNumber(e.target.value)} 
            required 
            min="1"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Session Name (Optional)</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Morning Session"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date & Time</label>
          <input 
            type="datetime-local" 
            value={startAt} 
            onChange={(e) => setStartAt(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Date & Time</label>
          <input 
            type="datetime-local" 
            value={endAt} 
            onChange={(e) => setEndAt(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
        >
          {isSubmitting ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
};
