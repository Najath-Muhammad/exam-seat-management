import { TAny } from '../../../types/any';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSeatAssignment } from '../hooks/useSeatAssignment';
import { SeatMapDashboard } from '../components/SeatMapDashboard';
import { SeatMapVisualGrid } from '../components/SeatMapVisualGrid';
import { CandidateAssignmentsTable } from '../components/CandidateAssignmentsTable';
import { SeatMapItem } from '../types/seatMap.types';
import { complaintApi } from '../../complaints/services/complaintApi';

export const SeatAssignmentPage: React.FC = () => {
  const { examId, sessionId } = useParams<{ examId: string; sessionId: string }>();
  const {
    seatMap,
    recoveryStatus,
    historyAssignments,
    isLoading,
    error,
    fetchData,
    manualAssign,
    reassignSeat,
    loadTargetSessions,
    loadTargetSeats,
    availableSessions,
    targetAvailableSeats,
    isFetchingTargetSeats,
    moveSession,
    cancelAssignment,
    runInitialAllocation,
    isAllocating,
    allocationResult,
  } = useSeatAssignment(examId, sessionId);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates' | 'map'>('dashboard');

  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState('');
  
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignData, setReassignData] = useState({ assignmentId: '', newSeatId: '', reason: '' });

  const [showMoveSessionModal, setShowMoveSessionModal] = useState(false);
  const [moveSessionData, setMoveSessionData] = useState({ assignmentId: '', newSessionId: '', newSeatId: '', reason: '' });

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({ candidateId: '', description: '' });

  const [selectedSeatDetails, setSelectedSeatDetails] = useState<SeatMapItem | null>(null);

  const handleManualAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId || !selectedSeatId) return;
    try {
      await manualAssign(selectedCandidateId, selectedSeatId);
      setShowAssignModal(false);
      setSelectedCandidateId('');
      setSelectedSeatId('');
      setSelectedSeatDetails(null);
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to assign seat');
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reassignSeat(reassignData.assignmentId, reassignData.newSeatId, reassignData.reason);
      setShowReassignModal(false);
      setReassignData({ assignmentId: '', newSeatId: '', reason: '' });
      setSelectedSeatDetails(null);
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to reassign seat');
    }
  };

  const openMoveSessionModal = async (assignmentId: string) => {
    try {
      await loadTargetSessions(sessionId!);
      setMoveSessionData({ assignmentId, newSessionId: '', newSeatId: '', reason: '' });
      setShowMoveSessionModal(true);
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to load sessions');
    }
  };

  const handleMoveSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Confirm Candidate Movement? This action will update the candidate\'s active allocation and move them to a completely different session.')) return;
    try {
      await moveSession(moveSessionData.assignmentId, moveSessionData.newSessionId, moveSessionData.newSeatId, moveSessionData.reason);
      alert('Candidate successfully moved to the new session.');
      setShowMoveSessionModal(false);
      setSelectedSeatDetails(null);
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to move candidate');
    }
  };

  const handleTargetSessionChange = async (newSessionId: string) => {
    setMoveSessionData(prev => ({ ...prev, newSessionId, newSeatId: '' }));
    if (!newSessionId) return;
    try {
      await loadTargetSeats(newSessionId);
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to load available seats');
    }
  };

  const handleInitialAllocation = async () => {
    if (!seatMap) return;
    const confirmMessage = `Initial Seat Allocation\n\nCandidates requiring allocation: ${seatMap.summary.unassignedCandidates}\nAvailable seats: ${seatMap.summary.vacantSeats}\n\nAllocation strategy:\nRegistration Number → Seat Number\n\nDo you want to continue?`;
    if (!window.confirm(confirmMessage)) return;
    try {
      await runInitialAllocation();
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Initial allocation failed');
    }
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this assignment?')) return;
    try {
      await cancelAssignment(assignmentId);
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to cancel assignment');
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await complaintApi.registerComplaint(complaintData.candidateId, sessionId!, complaintData.description);
      alert('Complaint registered successfully.');
      setShowComplaintModal(false);
      setComplaintData({ candidateId: '', description: '' });
    } catch (err: TAny) {
      alert(err.response?.data?.message || 'Failed to register complaint');
    }
  };

  if (isLoading && !seatMap) return <div>Loading seat map data...</div>;
  if (error) return (
    <div>
      <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
      <button onClick={fetchData}>Retry Loading</button>
    </div>
  );
  if (!seatMap) return null;

  const assignedCandidatesFlat = seatMap.seats
    .filter(s => s.mapStatus === 'OCCUPIED' && s.candidate)
    .map(s => ({ ...s.candidate!, isAssigned: true, seatNumber: s.seatNumber, assignmentId: s.assignment!.assignmentId }));
  
  const unassignedCandidatesFlat = seatMap.unassignedCandidates.map(c => ({
    candidateId: c._id, registrationNumber: c.registrationNumber, name: c.name, isAssigned: false, seatNumber: null, assignmentId: null
  }));

  const allCandidatesList = [...assignedCandidatesFlat, ...unassignedCandidatesFlat].sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
  const availableSeats = seatMap.seats.filter(s => s.mapStatus === 'VACANT');

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Session Seat Map & Allocation</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to={`/admin/exams/${examId}/sessions/${sessionId}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            &larr; Back to Session Details
          </Link>
          <button onClick={fetchData} className="btn-primary" style={{ backgroundColor: 'var(--text-muted)' }}>
            ↻ Refresh State
          </button>
        </div>
      </div>

      {recoveryStatus && !recoveryStatus.isConsistent && (
        <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>⚠ SYSTEM STATE REQUIRES ATTENTION</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>The current session has {recoveryStatus.issues.length} inconsistent assignment data issues.</p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {recoveryStatus.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0', marginBottom: '2rem', marginTop: '1.5rem' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ fontWeight: activeTab === 'dashboard' ? 600 : 500, color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'dashboard' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0.75rem 0', borderRadius: 0, boxShadow: 'none' }} className="btn-tab">Dashboard</button>
        <button onClick={() => setActiveTab('map')} style={{ fontWeight: activeTab === 'map' ? 600 : 500, color: activeTab === 'map' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'map' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0.75rem 0', borderRadius: 0, boxShadow: 'none' }} className="btn-tab">Visual Seat Map</button>
        <button onClick={() => setActiveTab('candidates')} style={{ fontWeight: activeTab === 'candidates' ? 600 : 500, color: activeTab === 'candidates' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'candidates' ? '2px solid var(--primary)' : '2px solid transparent', padding: '0.75rem 0', borderRadius: 0, boxShadow: 'none' }} className="btn-tab">Candidates & List</button>
      </div>

      {activeTab === 'dashboard' && (
        <SeatMapDashboard 
          seatMap={seatMap}
          isAllocating={isAllocating}
          allocationResult={allocationResult}
          onManualAssignClick={() => setShowAssignModal(true)}
          onInitialAllocationClick={handleInitialAllocation}
          onCandidateAssignClick={(cId) => { setSelectedCandidateId(cId); setShowAssignModal(true); }}
        />
      )}

      {activeTab === 'map' && (
        <SeatMapVisualGrid 
          seats={seatMap.seats} 
          onSeatClick={setSelectedSeatDetails} 
        />
      )}

      {activeTab === 'candidates' && (
        <CandidateAssignmentsTable 
          allCandidatesList={allCandidatesList}
          historyAssignments={historyAssignments}
          onManualAssignClick={(cId) => { setSelectedCandidateId(cId); setShowAssignModal(true); }}
          onReassignClick={(aId) => { setReassignData({ assignmentId: aId, newSeatId: '', reason: '' }); setShowReassignModal(true); }}
          onMoveSessionClick={openMoveSessionModal}
          onCancelAssignmentClick={handleCancelAssignment}
          onRegisterComplaintClick={(cId) => { setComplaintData({ candidateId: cId, description: '' }); setShowComplaintModal(true); }}
        />
      )}

      {}
      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Manual Assign Seat</h3>
            <form onSubmit={handleManualAssignSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Candidate</label>
                <select value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">Select an unassigned candidate...</option>
                  {seatMap.unassignedCandidates.map(c => (
                    <option key={c._id} value={c._id}>{c.registrationNumber} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Available Seat</label>
                <select value={selectedSeatId} onChange={e => setSelectedSeatId(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">Select an available seat...</option>
                  {availableSeats.map(s => (
                    <option key={s.seatId} value={s.seatId}>{s.seatNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Assign</button>
                <button type="button" onClick={() => setShowAssignModal(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showReassignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Reassign Seat</h3>
            <form onSubmit={handleReassignSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Available Seat</label>
                <select value={reassignData.newSeatId} onChange={e => setReassignData({...reassignData, newSeatId: e.target.value})} required style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">Select a new available seat...</option>
                  {availableSeats.map(s => (
                    <option key={s.seatId} value={s.seatId}>{s.seatNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Reason</label>
                <input type="text" value={reassignData.reason} onChange={e => setReassignData({...reassignData, reason: e.target.value})} required placeholder="e.g. Physical seat damaged" style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirm</button>
                <button type="button" onClick={() => setShowReassignModal(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showMoveSessionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '450px' }}>
            <h3>Move Candidate to Another Session</h3>
            <form onSubmit={handleMoveSessionSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Target Session</label>
                <select value={moveSessionData.newSessionId} onChange={e => handleTargetSessionChange(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">Select a target session...</option>
                  {availableSessions.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.status})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Available Seat</label>
                <select value={moveSessionData.newSeatId} onChange={e => setMoveSessionData({...moveSessionData, newSeatId: e.target.value})} required disabled={!moveSessionData.newSessionId || isFetchingTargetSeats} style={{ width: '100%', padding: '0.5rem' }}>
                  <option value="">{isFetchingTargetSeats ? 'Loading...' : 'Select a new seat...'}</option>
                  {targetAvailableSeats.map(s => (
                    <option key={s._id} value={s._id}>{s.seatNumber} (Row: {s.row})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Reason</label>
                <input type="text" value={moveSessionData.reason} onChange={e => setMoveSessionData({...moveSessionData, reason: e.target.value})} required placeholder="e.g. Schedule conflict" style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" disabled={!moveSessionData.newSeatId} style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: moveSessionData.newSeatId ? 'pointer' : 'not-allowed' }}>Confirm Move</button>
                <button type="button" onClick={() => setShowMoveSessionModal(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {selectedSeatDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Seat Details: {selectedSeatDetails.seatNumber}</h3>
            
            <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              <p><strong>Status:</strong> {selectedSeatDetails.mapStatus}</p>
              
              {selectedSeatDetails.mapStatus === 'OCCUPIED' && selectedSeatDetails.candidate && selectedSeatDetails.assignment && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                  <p><strong>Candidate:</strong> {selectedSeatDetails.candidate.name}</p>
                  <p><strong>Registration:</strong> {selectedSeatDetails.candidate.registrationNumber}</p>
                  <p><strong>Assignment:</strong> {selectedSeatDetails.assignment.assignmentNumber}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {selectedSeatDetails.mapStatus === 'VACANT' && (
                <button onClick={() => { setSelectedSeatId(selectedSeatDetails.seatId); setShowAssignModal(true); }} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Assign</button>
              )}
              {selectedSeatDetails.mapStatus === 'OCCUPIED' && (
                <>
                  <button onClick={() => { setReassignData({ assignmentId: selectedSeatDetails.assignment!.assignmentId, newSeatId: '', reason: '' }); setShowReassignModal(true); }} style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reassign</button>
                  <button onClick={() => openMoveSessionModal(selectedSeatDetails.assignment!.assignmentId)} style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Transfer</button>
                </>
              )}
              <button onClick={() => setSelectedSeatDetails(null)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {}
      {showComplaintModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Register Candidate Complaint</h3>
            <form onSubmit={handleComplaintSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Complaint Description</label>
                <textarea 
                  value={complaintData.description} 
                  onChange={e => setComplaintData({...complaintData, description: e.target.value})} 
                  required 
                  placeholder="Describe the issue the candidate is facing..." 
                  style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Complaint</button>
                <button type="button" onClick={() => setShowComplaintModal(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
