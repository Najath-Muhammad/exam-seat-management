import React, { useEffect, useState } from 'react';
import { SeatListResponse, SeatStatus, GenerateSeatsResult } from '../types/seat.types';
import { seatApi } from '../services/seatApi';

export const SeatManagementPage: React.FC = () => {
  const [data, setData] = useState<SeatListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'generate'>('list');

  
  const [genRows, setGenRows] = useState('');
  const [genSeatsPerRow, setGenSeatsPerRow] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genResult, setGenResult] = useState<GenerateSeatsResult | null>(null);

  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSeat, setNewSeat] = useState({ seatNumber: '', row: '', column: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchSeats = async () => {
    setIsLoading(true);
    try {
      const result = await seatApi.getSeats(page, limit, filterStatus);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load seats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    
  }, [page, filterStatus]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('This will generate multiple seats. Proceed?')) return;
    
    setIsGenerating(true);
    setGenResult(null);
    try {
      const result = await seatApi.generateSeats({
        rows: parseInt(genRows, 10),
        seatsPerRow: parseInt(genSeatsPerRow, 10)
      });
      setGenResult(result);
      fetchSeats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await seatApi.createSeat({
        seatNumber: newSeat.seatNumber,
        row: newSeat.row,
        column: parseInt(newSeat.column, 10)
      });
      setShowAddForm(false);
      setNewSeat({ seatNumber: '', row: '', column: '' });
      fetchSeats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add seat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (seatId: string) => {
    if (!window.confirm('Are you sure you want to delete this physical seat?')) return;
    try {
      await seatApi.deleteSeat(seatId);
      fetchSeats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete seat');
    }
  };

  const handleStatusChange = async (seatId: string, status: SeatStatus) => {
    try {
      await seatApi.updateSeat(seatId, { status });
      fetchSeats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading && !data) return <div>Loading physical seats...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!data) return null;

  const filteredSeats = data.seats.filter(s => 
    s.seatNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.row.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Physical Seat Management</h2>
        <div className="text-muted">Total Configured Seats: {data.total}</div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('list')} style={{ fontWeight: activeTab === 'list' ? 600 : 500, color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0.75rem 0', borderRadius: 0, boxShadow: 'none' }} className="btn-tab">Seat List</button>
        <button onClick={() => setActiveTab('map')} style={{ fontWeight: activeTab === 'map' ? 600 : 500, color: activeTab === 'map' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'map' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0.75rem 0', borderRadius: 0, boxShadow: 'none' }} className="btn-tab">Visual Map</button>
        <button onClick={() => setActiveTab('generate')} style={{ fontWeight: activeTab === 'generate' ? 600 : 500, color: activeTab === 'generate' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'generate' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0.75rem 0', borderRadius: 0, boxShadow: 'none' }} className="btn-tab">Bulk Generate</button>
      </div>

      {activeTab === 'generate' && (
        <div style={{ maxWidth: '600px' }}>
          <h3>Bulk Seat Generator</h3>
          <p style={{ color: '#6c757d' }}>Quickly create the physical layout of your exam center.</p>
          
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #ddd' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Number of Rows</label>
              <input type="number" value={genRows} onChange={e => setGenRows(e.target.value)} required min="1" max="26" style={{ width: '100%', padding: '0.5rem' }} placeholder="e.g. 5" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Seats per Row</label>
              <input type="number" value={genSeatsPerRow} onChange={e => setGenSeatsPerRow(e.target.value)} required min="1" max="100" style={{ width: '100%', padding: '0.5rem' }} placeholder="e.g. 10" />
            </div>
            
            {genRows && genSeatsPerRow && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '0.9rem' }}>
                <strong>Preview:</strong> Will generate {parseInt(genRows) * parseInt(genSeatsPerRow)} seats.
                (A01 to {String.fromCharCode(64 + parseInt(genRows))}{String(parseInt(genSeatsPerRow)).padStart(2, '0')})
              </div>
            )}

            <button type="submit" disabled={isGenerating} style={{ padding: '0.75rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}>
              {isGenerating ? 'Generating...' : 'Generate Seats'}
            </button>
          </form>

          {genResult && (
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #17a2b8', borderRadius: '4px', backgroundColor: '#e0f7fa' }}>
              <h4>Generation Completed</h4>
              <p>Requested: {genResult.requested}</p>
              <p>Created: {genResult.created}</p>
              <p>Skipped (Already Existed): {genResult.skipped}</p>
              {genResult.skipped > 0 && (
                <details style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  <summary>View Skipped Seats</summary>
                  <p>{genResult.skippedSeats.join(', ')}</p>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div>
          <h3>Visual Seat Map (Current Page)</h3>
          <p style={{ color: '#6c757d', marginBottom: '2rem' }}>This map shows physical conditions, not session occupancy.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {Array.from(new Set(filteredSeats.map(s => s.row))).sort().map(row => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <strong style={{ width: '30px', fontSize: '1.2rem' }}>{row}</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {filteredSeats.filter(s => s.row === row).sort((a, b) => a.column - b.column).map(seat => (
                    <div 
                      key={seat._id} 
                      title={`Seat: ${seat.seatNumber}\nStatus: ${seat.status}`}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'white',
                        cursor: 'help',
                        backgroundColor: seat.status === SeatStatus.ACTIVE ? '#28a745' : seat.status === SeatStatus.MAINTENANCE ? '#ffc107' : '#dc3545'
                      }}
                    >
                      {seat.seatNumber}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#28a745' }}></div> Active</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#ffc107' }}></div> Maintenance</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#dc3545' }}></div> Inactive</span>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" placeholder="Search seats..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem' }} />
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ padding: '0.5rem' }}>
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + Add Single Seat
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddSeat} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1.5rem', backgroundColor: '#f8f9fa' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Seat Number (e.g. A01)" required value={newSeat.seatNumber} onChange={e => setNewSeat({...newSeat, seatNumber: e.target.value.toUpperCase()})} style={{ padding: '0.5rem' }} />
                <input type="text" placeholder="Row (e.g. A)" required value={newSeat.row} onChange={e => setNewSeat({...newSeat, row: e.target.value.toUpperCase()})} style={{ padding: '0.5rem' }} />
                <input type="number" placeholder="Column (e.g. 1)" required min="1" value={newSeat.column} onChange={e => setNewSeat({...newSeat, column: e.target.value})} style={{ padding: '0.5rem' }} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button type="submit" disabled={isSaving} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Seat</button>
              </div>
            </form>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem' }}>Seat Number</th>
                <th style={{ padding: '0.5rem' }}>Row</th>
                <th style={{ padding: '0.5rem' }}>Column</th>
                <th style={{ padding: '0.5rem' }}>Physical Status</th>
                <th style={{ padding: '0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeats.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{s.seatNumber}</td>
                  <td style={{ padding: '0.5rem' }}>{s.row}</td>
                  <td style={{ padding: '0.5rem' }}>{s.column}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <select 
                      value={s.status} 
                      onChange={(e) => handleStatusChange(s._id, e.target.value as SeatStatus)}
                      style={{ padding: '0.25rem', borderRadius: '4px' }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <button onClick={() => handleDelete(s._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <span>Showing {filteredSeats.length} on this page (Total {data.total})</span>
            <div>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '0.5rem', marginRight: '0.5rem' }}>Previous</button>
              <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} style={{ padding: '0.5rem' }}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
