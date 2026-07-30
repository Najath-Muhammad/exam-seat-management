import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CandidateListResponse, BulkImportResult } from '../types/candidate.types';
import { candidateApi } from '../services/candidateApi';
import { sessionApi } from '../../sessions/services/sessionApi';
import { Session } from '../../sessions/types/session.types';

export const CandidateListPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  
  const [data, setData] = useState<CandidateListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  
  // Add Candidate Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ registrationNumber: '', name: '', email: '', phone: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const [sessionData, candidatesData] = await Promise.all([
        sessionApi.getSession(sessionId),
        candidateApi.getCandidatesBySession(sessionId, page, limit)
      ]);
      setSession(sessionData);
      setData(candidatesData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, page]);

  const handleFinalize = async () => {
    if (!sessionId) return;
    if (!window.confirm('Once finalized, candidates cannot normally be added or removed from this session.\n\nAre you sure?')) return;
    
    setIsFinalizing(true);
    try {
      await candidateApi.finalizeCandidates(sessionId);
      await fetchData(); // Refresh session to get updated isCandidatesFinalized
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to finalize candidate list');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!sessionId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setImportResult(null);
    setIsImporting(true);
    try {
      const result = await candidateApi.bulkImport(sessionId, file);
      setImportResult(result);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    
    setAddError(null);
    setIsAdding(true);
    try {
      await candidateApi.createCandidate(sessionId, newCandidate);
      setShowAddForm(false);
      setNewCandidate({ registrationNumber: '', name: '', email: '', phone: '' });
      await fetchData();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (candidateId: string) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await candidateApi.deleteCandidate(candidateId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete candidate');
    }
  };

  if (isLoading && !data) return <div>Loading candidates...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!session || !data) return null;

  const isFinalized = (session as any).isCandidatesFinalized;

  const filteredCandidates = data.candidates.filter(c => 
    c.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link to={`/admin/sessions/${sessionId}`} style={{ color: '#6c757d', textDecoration: 'none' }}>
          &larr; Back to Session Details
        </Link>
        {isFinalized ? (
          <span style={{ padding: '0.5rem 1rem', backgroundColor: '#e9ecef', border: '1px solid #ced4da', borderRadius: '4px', fontWeight: 'bold' }}>
            Candidate List Finalized
          </span>
        ) : (
          <button 
            onClick={handleFinalize} 
            disabled={isFinalizing}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isFinalizing ? 'Finalizing...' : 'Finalize Candidate List'}
          </button>
        )}
      </div>

      <h2>Candidates for Session {session.sessionNumber}</h2>
      
      {!isFinalized && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            + Add Candidate
          </button>
          
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleImport}
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isImporting}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {isImporting ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      )}

      {importResult && (
        <div style={{ padding: '1rem', border: '1px solid #17a2b8', borderRadius: '4px', marginBottom: '1.5rem', backgroundColor: '#e0f7fa' }}>
          <h4>Import Completed</h4>
          <p>Successfully Imported: {importResult.imported}</p>
          <p>Failed: {importResult.failed}</p>
          {importResult.errors.length > 0 && (
            <div style={{ marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto', backgroundColor: 'white', padding: '0.5rem', border: '1px solid #ddd' }}>
              {importResult.errors.map((err, i) => (
                <div key={i} style={{ color: 'red', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Row {err.row} ({err.registrationNumber}): {err.error}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setImportResult(null)} style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Close</button>
        </div>
      )}

      {showAddForm && !isFinalized && (
        <form onSubmit={handleAddCandidate} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1.5rem', backgroundColor: '#f8f9fa' }}>
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
            <button type="button" onClick={() => setShowAddForm(false)} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #6c757d', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Search by name, reg num, email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', width: '300px' }}
        />
      </div>

      {filteredCandidates.length === 0 ? (
        <p>No candidates found.</p>
      ) : (
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
            {filteredCandidates.map(c => (
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
                    <button onClick={() => handleDelete(c._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <span>Showing {filteredCandidates.length} of {data.total} total candidates (Page {data.page} of {data.totalPages})</span>
        <div>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '0.5rem', marginRight: '0.5rem' }}>Previous</button>
          <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} style={{ padding: '0.5rem' }}>Next</button>
        </div>
      </div>
    </div>
  );
};
