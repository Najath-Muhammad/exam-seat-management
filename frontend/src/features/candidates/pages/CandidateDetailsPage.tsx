import { TAny } from '../../../types/any';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Candidate } from '../types/candidate.types';
import { candidateApi } from '../services/candidateApi';

export const CandidateDetailsPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) return;
    const fetchCandidate = async () => {
      try {
        const data = await candidateApi.getCandidate(candidateId);
        setCandidate(data);
      } catch (err: TAny) {
        setError(err.response?.data?.message || 'Failed to load candidate');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidate();
  }, [candidateId]);

  if (isLoading) return <div>Loading candidate details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!candidate) return <div>Candidate not found.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => window.history.back()} style={{ border: 'none', background: 'none', color: '#6c757d', cursor: 'pointer', padding: 0 }}>
          &larr; Back
        </button>
      </div>

      <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Candidate Details</h2>
          <span style={{ padding: '0.5rem 1rem', backgroundColor: '#e9ecef', borderRadius: '4px', fontWeight: 'bold' }}>
            {candidate.status}
          </span>
        </div>
        
        <table style={{ width: '100%', textAlign: 'left', marginTop: '1.5rem', lineHeight: '2' }}>
          <tbody>
            <tr>
              <th style={{ width: '200px' }}>Registration Number</th>
              <td><strong>{candidate.registrationNumber}</strong></td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{candidate.name}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{candidate.email || 'N/A'}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{candidate.phone || 'N/A'}</td>
            </tr>
            <tr>
              <th>Session ID</th>
              <td>{candidate.sessionId}</td>
            </tr>
            <tr>
              <th>Created At</th>
              <td>{new Date(candidate.createdAt).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4>Physical Seat</h4>
          <p style={{ color: '#6c757d' }}>Not assigned yet</p>
        </div>
      </div>
    </div>
  );
};
