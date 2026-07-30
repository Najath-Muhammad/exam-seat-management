import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCandidates } from '../hooks/useCandidates';
import { CandidateTable } from '../components/CandidateTable';
import { AddCandidateForm } from '../components/AddCandidateForm';

export const CandidateListPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    session, data, page, setPage, isLoading, error,
    isFinalizing, finalizeList, isImporting, importResult, setImportResult,
    importCSV, addCandidate, deleteCandidate
  } = useCandidates(sessionId);

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFinalize = async () => {
    if (!window.confirm('Once finalized, candidates cannot normally be added or removed from this session.\n\nAre you sure?')) return;
    try {
      await finalizeList();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to finalize candidate list');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importCSV(file);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddSubmit = async (newCandidate: any) => {
    await addCandidate(newCandidate);
    setShowAddForm(false);
  };

  const handleDelete = async (candidateId: string) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await deleteCandidate(candidateId);
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
          <button onClick={handleFinalize} disabled={isFinalizing} style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
          
          <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
        <AddCandidateForm onSubmit={handleAddSubmit} onCancel={() => setShowAddForm(false)} />
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input type="text" placeholder="Search by name, reg num, email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '0.5rem', width: '300px' }} />
      </div>

      <CandidateTable candidates={filteredCandidates} isFinalized={isFinalized} onDelete={handleDelete} />

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
