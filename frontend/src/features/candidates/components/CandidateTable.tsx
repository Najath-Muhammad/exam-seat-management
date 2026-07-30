import React from 'react';
import { Link } from 'react-router-dom';
import { Candidate } from '../types/candidate.types';

interface Props {
  candidates: Candidate[];
  isFinalized: boolean;
  onDelete: (id: string) => void;
}

export const CandidateTable: React.FC<Props> = ({ candidates, isFinalized, onDelete }) => {
  if (candidates.length === 0) return <p>No candidates found.</p>;
  
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #ddd' }}>
          <th style={{ padding: '0.5rem' }}>Reg No</th>
          <th style={{ padding: '0.5rem' }}>Name</th>
          <th style={{ padding: '0.5rem' }}>Email</th>
          <th style={{ padding: '0.5rem' }}>Status</th>
          <th style={{ padding: '0.5rem' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map(c => (
          <tr key={c._id} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{c.registrationNumber}</td>
            <td style={{ padding: '0.5rem' }}>{c.name}</td>
            <td style={{ padding: '0.5rem' }}>{c.email || '-'}</td>
            <td style={{ padding: '0.5rem' }}>
              <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '0.85rem' }}>
                {c.status}
              </span>
            </td>
            <td style={{ padding: '0.5rem' }}>
              <Link to={`/admin/candidates/${c._id}`} style={{ marginRight: '1rem', color: '#007bff' }}>View</Link>
              {!isFinalized && (
                <button onClick={() => onDelete(c._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
