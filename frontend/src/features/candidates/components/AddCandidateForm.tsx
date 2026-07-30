import React, { useState } from 'react';import { TAny } from '../../../types/any';


interface Props {
  onSubmit: (data: TAny) => Promise<void>;
  onCancel: () => void;
}

export const AddCandidateForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [newCandidate, setNewCandidate] = useState({ registrationNumber: '', name: '', email: '', phone: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setIsAdding(true);
    try {
      await onSubmit(newCandidate);
      setNewCandidate({ registrationNumber: '', name: '', email: '', phone: '' });
    } catch (err: TAny) {
      setAddError(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1.5rem', backgroundColor: '#f8f9fa' }}>
      <h4>Add New Candidate</h4>
      {addError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{addError}</p>}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Registration Number" required value={newCandidate.registrationNumber} onChange={e => setNewCandidate({...newCandidate, registrationNumber: e.target.value})} style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Name" required value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} style={{ padding: '0.5rem' }} />
        <input type="email" placeholder="Email" value={newCandidate.email} onChange={e => setNewCandidate({...newCandidate, email: e.target.value})} style={{ padding: '0.5rem' }} />
        <input type="text" placeholder="Phone" value={newCandidate.phone} onChange={e => setNewCandidate({...newCandidate, phone: e.target.value})} style={{ padding: '0.5rem' }} />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button type="submit" disabled={isAdding} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isAdding ? 'Adding...' : 'Save Candidate'}
        </button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #6c757d', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  );
};
