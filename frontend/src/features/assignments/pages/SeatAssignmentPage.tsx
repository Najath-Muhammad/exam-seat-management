import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { seatAssignmentApi } from '../services/seatAssignmentApi';
import { seatMapApi } from '../services/seatMapApi';
import { sessionApi } from '../../sessions/services/sessionApi';
import { InitialAllocationResult, SeatAssignment, AssignmentStatus } from '../types/seatAssignment.types';
import { SeatMapData, RecoveryStatus, SeatMapItem } from '../types/seatMap.types';
import { Candidate } from '../../candidates/types/candidate.types';
import { Seat } from '../../seats/types/seat.types';
import { Session } from '../../sessions/types/session.types';

export const SeatAssignmentPage: React.FC = () => {
  const { examId, sessionId } = useParams<{ examId: string; sessionId: string }>();

  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus | null>(null);
  
  const [historyAssignments, setHistoryAssignments] = useState<SeatAssignment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates' | 'map'>('dashboard');

  // Modals & Assignments
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState('');
  
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignData, setReassignData] = useState({ assignmentId: '', newSeatId: '', reason: '' });

  // Move Session State
  const [showMoveSessionModal, setShowMoveSessionModal] = useState(false);
  const [moveSessionData, setMoveSessionData] = useState({ assignmentId: '', newSessionId: '', newSeatId: '', reason: '' });
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [targetAvailableSeats, setTargetAvailableSeats] = useState<Seat[]>([]);
  const [isFetchingTargetSeats, setIsFetchingTargetSeats] = useState(false);

  // Initial Allocation
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationResult, setAllocationResult] = useState<InitialAllocationResult | null>(null);

  // Map Filter/Search
  const [mapFilter, setMapFilter] = useState<'ALL' | 'OCCUPIED' | 'VACANT' | 'MAINTENANCE' | 'INACTIVE'>('ALL');
  const [mapSearch, setMapSearch] = useState('');
  
  // Seat Details Modal
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<SeatMapItem | null>(null);

  const fetchData = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const [mapData, recStatus, assigData] = await Promise.all([
        seatMapApi.getSeatMap(sessionId),
        seatMapApi.getRecoveryStatus(sessionId),
        seatAssignmentApi.getSessionAssignments(sessionId)
      ]);
      setSeatMap(mapData);
      setRecoveryStatus(recStatus);
      setHistoryAssignments(assigData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load seat map data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleManualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !selectedCandidateId || !selectedSeatId) return;

    try {
      await seatAssignmentApi.assignSeat(sessionId, { candidateId: selectedCandidateId, seatId: selectedSeatId });
      setShowAssignModal(false);
      setSelectedCandidateId('');
      setSelectedSeatId('');
      setSelectedSeatDetails(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign seat');
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await seatAssignmentApi.reassignSeat(reassignData.assignmentId, { newSeatId: reassignData.newSeatId, reason: reassignData.reason });
      setShowReassignModal(false);
      setReassignData({ assignmentId: '', newSeatId: '', reason: '' });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reassign seat');
    }
  };

  const openMoveSessionModal = async (assignmentId: string) => {
    if (!examId) return;
    try {
      const sessions = await sessionApi.getSessions(examId);
      // Filter out the current session and completed sessions
      setAvailableSessions(sessions.filter(s => s._id !== sessionId && s.status !== 'COMPLETED'));
      setMoveSessionData({ assignmentId, newSessionId: '', newSeatId: '', reason: '' });
      setTargetAvailableSeats([]);
      setShowMoveSessionModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load sessions');
    }
  };

  const handleTargetSessionChange = async (newSessionId: string) => {
    setMoveSessionData(prev => ({ ...prev, newSessionId, newSeatId: '' }));
    if (!newSessionId) {
      setTargetAvailableSeats([]);
      return;
    }
    
    setIsFetchingTargetSeats(true);
    try {
      const seats = await seatAssignmentApi.getAvailableSeats(newSessionId);
      setTargetAvailableSeats(seats);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load available seats for target session');
      setTargetAvailableSeats([]);
    } finally {
      setIsFetchingTargetSeats(false);
    }
  };

  const handleMoveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Confirm Candidate Movement?\nThis action will update the candidate\'s active allocation and move them to a completely different session.')) return;
    
    try {
      await seatAssignmentApi.moveCandidateToSession(moveSessionData.assignmentId, { 
        newSessionId: moveSessionData.newSessionId,
        newSeatId: moveSessionData.newSeatId, 
        reason: moveSessionData.reason 
      });
      alert('Candidate successfully moved to the new session.');
      setShowMoveSessionModal(false);
      setSelectedSeatDetails(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to move candidate to new session');
    }
  };

  const handleInitialAllocation = async () => {
    if (!sessionId || !seatMap) return;
    
    const confirmMessage = `Initial Seat Allocation\n\nCandidates requiring allocation: ${seatMap.summary.unassignedCandidates}\nAvailable seats: ${seatMap.summary.vacantSeats}\n\nAllocation strategy:\nRegistration Number → Seat Number\n\nDo you want to continue?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setIsAllocating(true);
    setAllocationResult(null);
    try {
      const result = await seatAssignmentApi.runInitialAllocation(sessionId);
      setAllocationResult(result);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Initial allocation failed');
    } finally {
      setIsAllocating(false);
    }
  };

  const handleCancelAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this assignment? The candidate will become unassigned.')) return;
    try {
      await seatAssignmentApi.cancelAssignment(assignmentId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel assignment');
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

  // Derive flat list of all candidates for the Candidates tab
  const assignedCandidatesFlat = seatMap.seats
    .filter(s => s.mapStatus === 'OCCUPIED' && s.candidate)
    .map(s => ({ ...s.candidate!, isAssigned: true, seatNumber: s.seatNumber, assignmentId: s.assignment!.assignmentId }));
  
  const unassignedCandidatesFlat = seatMap.unassignedCandidates.map(c => ({
    candidateId: c._id, registrationNumber: c.registrationNumber, name: c.name, isAssigned: false, seatNumber: null, assignmentId: null
  }));

  const allCandidatesList = [...assignedCandidatesFlat, ...unassignedCandidatesFlat].sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));

  const availableSeats = seatMap.seats.filter(s => s.mapStatus === 'VACANT');

  const filteredSeats = seatMap.seats.filter(s => {
    if (mapFilter !== 'ALL' && s.mapStatus !== mapFilter) return false;
    if (mapSearch) {
      const search = mapSearch.toLowerCase();
      const matchesSeat = s.seatNumber.toLowerCase().includes(search);
      const matchesCand = s.candidate?.name.toLowerCase().includes(search) || s.candidate?.registrationNumber.toLowerCase().includes(search);
      return matchesSeat || matchesCand;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Link to={`/admin/exams/${examId}/sessions/${sessionId}`} style={{ color: '#6c757d', textDecoration: 'none' }}>
          &larr; Back to Session Details
        </Link>
        <button onClick={fetchData} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ↻ Refresh State
        </button>
      </div>

      <h2>Session Seat Map & Allocation</h2>

      {recoveryStatus && !recoveryStatus.isConsistent && (
        <div style={{ padding: '1rem', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>⚠ SYSTEM STATE REQUIRES ATTENTION</h3>
          <p style={{ margin: '0 0 0.5rem 0' }}>The current session has {recoveryStatus.issues.length} inconsistent assignment data issues. Please review and take manual action.</p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {recoveryStatus.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>Dashboard</button>
        <button onClick={() => setActiveTab('map')} style={{ fontWeight: activeTab === 'map' ? 'bold' : 'normal', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>Visual Seat Map</button>
        <button onClick={() => setActiveTab('candidates')} style={{ fontWeight: activeTab === 'candidates' ? 'bold' : 'normal', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>Candidates & List</button>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', minWidth: '200px' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>SESSION STATUS (SEATS)</h4>
              <p>Total Seats: {seatMap.summary.totalSeats}</p>
              <p style={{ color: '#007bff', fontWeight: 'bold' }}>Occupied: {seatMap.summary.occupiedSeats}</p>
              <p style={{ color: '#28a745', fontWeight: 'bold' }}>Vacant: {seatMap.summary.vacantSeats}</p>
              <p style={{ color: '#ffc107', fontWeight: 'bold' }}>Maintenance: {seatMap.summary.maintenanceSeats}</p>
              <p style={{ color: '#dc3545', fontWeight: 'bold' }}>Inactive: {seatMap.summary.inactiveSeats}</p>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', minWidth: '200px' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>CANDIDATES</h4>
              <p>Total: {seatMap.summary.totalCandidates}</p>
              <p>Assigned: {seatMap.summary.assignedCandidates}</p>
              <p style={{ color: seatMap.summary.unassignedCandidates > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                Unassigned: {seatMap.summary.unassignedCandidates}
              </p>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#e9ecef', border: '1px solid #ced4da', borderRadius: '8px', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>Allocation Status</h4>
              {seatMap.summary.unassignedCandidates === 0 ? (
                <div style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2rem' }}>✓ COMPLETE</div>
              ) : (
                <div style={{ color: 'orange', fontWeight: 'bold', fontSize: '1.2rem' }}>READY</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button onClick={() => setShowAssignModal(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Manual Assign Seat
            </button>
            <button onClick={handleInitialAllocation} disabled={isAllocating || seatMap.summary.unassignedCandidates === 0} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isAllocating ? 'Allocating seats...' : 'Run Initial Allocation'}
            </button>
          </div>

          {allocationResult && (
            <div style={{ padding: '1.5rem', backgroundColor: allocationResult.status === 'COMPLETE' ? '#d4edda' : '#fff3cd', border: `1px solid ${allocationResult.status === 'COMPLETE' ? '#c3e6cb' : '#ffeeba'}`, borderRadius: '4px', marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>
                {allocationResult.status === 'COMPLETE' ? 'Initial Allocation Completed' : 'Initial Allocation Partially Completed'}
              </h4>
              <p>Total Candidates: {allocationResult.totalCandidates}</p>
              <p>Already Assigned: {allocationResult.alreadyAssigned}</p>
              <p>Newly Allocated: {allocationResult.newlyAllocated}</p>
              <p style={{ color: allocationResult.unallocated > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                Unallocated: {allocationResult.unallocated}
              </p>
            </div>
          )}
          
          {seatMap.unassignedCandidates.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ color: 'red' }}>Unallocated Candidates ({seatMap.unassignedCandidates.length})</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {seatMap.unassignedCandidates.map(c => (
                  <li key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                    <span><strong>{c.registrationNumber}</strong> - {c.name}</span>
                    <button 
                      onClick={() => { setSelectedCandidateId(c._id); setShowAssignModal(true); }}
                      style={{ padding: '0.25rem 0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Assign Seat
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Visual Seat Map</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select value={mapFilter} onChange={e => setMapFilter(e.target.value as any)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="ALL">All States</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="VACANT">Vacant</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <input 
                type="text" 
                placeholder="Search Candidate or Seat..." 
                value={mapSearch}
                onChange={e => setMapSearch(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', backgroundColor: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            {Array.from(new Set(filteredSeats.map(s => s.row))).sort().map(row => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <strong style={{ width: '30px', fontSize: '1.2rem' }}>{row}</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {filteredSeats.filter(s => s.row === row).sort((a, b) => a.column - b.column).map(seat => {
                    
                    let bgColor = '#e9ecef';
                    let color = 'black';
                    
                    if (seat.mapStatus === 'OCCUPIED') {
                      bgColor = '#007bff'; color = 'white';
                    } else if (seat.mapStatus === 'VACANT') {
                      bgColor = '#28a745'; color = 'white';
                    } else if (seat.mapStatus === 'MAINTENANCE') {
                      bgColor = '#ffc107'; color = 'black';
                    } else if (seat.mapStatus === 'INACTIVE') {
                      bgColor = '#dc3545'; color = 'white';
                    }

                    return (
                      <div 
                        key={seat.seatId} 
                        title={`Seat: ${seat.seatNumber}`}
                        onClick={() => setSelectedSeatDetails(seat)}
                        style={{ 
                          width: '45px', 
                          height: '45px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          color,
                          cursor: 'pointer',
                          backgroundColor: bgColor,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {seat.seatNumber}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredSeats.length === 0 && <p>No seats match your search/filter.</p>}
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#28a745', borderRadius: '3px' }}></div> Vacant</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#007bff', borderRadius: '3px' }}></div> Occupied</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#ffc107', borderRadius: '3px' }}></div> Maintenance</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', backgroundColor: '#dc3545', borderRadius: '3px' }}></div> Inactive</span>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div>
          <h3>Candidate Assignments</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.5rem' }}>Reg No</th>
                <th style={{ padding: '0.5rem' }}>Candidate Name</th>
                <th style={{ padding: '0.5rem' }}>Seat</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allCandidatesList.map(c => {
                return (
                  <tr key={c.candidateId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{c.registrationNumber}</td>
                    <td style={{ padding: '0.5rem' }}>{c.name}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>
                      {c.isAssigned ? c.seatNumber : '--'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {c.isAssigned ? (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Assigned</span>
                      ) : (
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {!c.isAssigned ? (
                        <button 
                          onClick={() => { setSelectedCandidateId(c.candidateId); setShowAssignModal(true); }}
                          style={{ padding: '0.25rem 0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Assign Seat
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => { 
                              setReassignData({ assignmentId: c.assignmentId!, newSeatId: '', reason: '' }); 
                              setShowReassignModal(true); 
                            }}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            title="Reassign to another seat in same session"
                          >
                            Reassign
                          </button>
                          <button 
                            onClick={() => openMoveSessionModal(c.assignmentId!)}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            title="Move Candidate to Another Session"
                          >
                            Transfer Session
                          </button>
                          <button 
                            onClick={() => handleCancelAssignment(c.assignmentId!)}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            title="Cancel Assignment"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <h3 style={{ marginTop: '3rem' }}>Assignment History</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
            {historyAssignments.length === 0 ? <p>No historical assignments yet.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {historyAssignments.map(a => (
                  <li key={a._id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                    <strong>{a.assignmentNumber}</strong> — Candidate: {(a.candidateId as Candidate).name} ({(a.candidateId as Candidate).registrationNumber}) — Seat: {(a.seatId as Seat).seatNumber}
                    <br/>
                    Status: <span style={{ 
                      fontWeight: 'bold', 
                      color: a.status === AssignmentStatus.ASSIGNED ? 'green' : 
                             (a.status === AssignmentStatus.REASSIGNED || a.status === AssignmentStatus.SESSION_TRANSFER) ? '#ffc107' : 'red' 
                    }}>{a.status}</span>
                    <br/>
                    <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      Assigned At: {new Date(a.assignedAt).toLocaleString()}
                      {a.reason && <span> | Reason: {a.reason}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Seat Details Modal */}
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
                  <hr style={{ margin: '0.5rem 0', borderColor: '#ddd' }}/>
                  <p><strong>Assignment Number:</strong> {selectedSeatDetails.assignment.assignmentNumber}</p>
                  <p><strong>Assigned At:</strong> {new Date(selectedSeatDetails.assignment.assignedAt).toLocaleString()}</p>
                  <p><strong>Assigned By:</strong> {selectedSeatDetails.assignment.assignedBy}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {selectedSeatDetails.mapStatus === 'VACANT' && (
                <button 
                  onClick={() => {
                    setSelectedSeatId(selectedSeatDetails.seatId);
                    setShowAssignModal(true);
                  }} 
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Assign Candidate
                </button>
              )}
              {selectedSeatDetails.mapStatus === 'OCCUPIED' && (
                <>
                  <button 
                    onClick={() => {
                      setReassignData({ assignmentId: selectedSeatDetails.assignment!.assignmentId, newSeatId: '', reason: '' });
                      setShowReassignModal(true);
                    }} 
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Reassign
                  </button>
                  <button 
                    onClick={() => openMoveSessionModal(selectedSeatDetails.assignment!.assignmentId)} 
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Transfer Session
                  </button>
                </>
              )}
              <button onClick={() => setSelectedSeatDetails(null)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assign Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Manual Assign Seat</h3>
            <form onSubmit={handleManualAssign}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Candidate</label>
                <select 
                  value={selectedCandidateId} 
                  onChange={e => setSelectedCandidateId(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select an unassigned candidate...</option>
                  {seatMap.unassignedCandidates.map(c => (
                    <option key={c._id} value={c._id}>{c.registrationNumber} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Available Seat</label>
                <select 
                  value={selectedSeatId} 
                  onChange={e => setSelectedSeatId(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.5rem' }}
                >
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

      {/* Reassign Modal */}
      {showReassignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
            <h3>Reassign Seat</h3>
            <form onSubmit={handleReassign}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Available Seat</label>
                <select 
                  value={reassignData.newSeatId} 
                  onChange={e => setReassignData({...reassignData, newSeatId: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select a new available seat...</option>
                  {availableSeats.map(s => (
                    <option key={s.seatId} value={s.seatId}>{s.seatNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Reason for Reassignment</label>
                <input 
                  type="text" 
                  value={reassignData.reason} 
                  onChange={e => setReassignData({...reassignData, reason: e.target.value})} 
                  required 
                  placeholder="e.g. Physical seat damaged"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirm Reassignment</button>
                <button type="button" onClick={() => { setShowReassignModal(false); setSelectedSeatDetails(null); }} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Session Modal */}
      {showMoveSessionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: '450px' }}>
            <h3>Move Candidate to Another Session</h3>
            <form onSubmit={handleMoveSession}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Target Session</label>
                <select 
                  value={moveSessionData.newSessionId} 
                  onChange={e => handleTargetSessionChange(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">Select a target session...</option>
                  {availableSessions.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.status})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Available Seat in Target Session</label>
                <select 
                  value={moveSessionData.newSeatId} 
                  onChange={e => setMoveSessionData({...moveSessionData, newSeatId: e.target.value})} 
                  required 
                  disabled={!moveSessionData.newSessionId || isFetchingTargetSeats}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="">{isFetchingTargetSeats ? 'Loading...' : 'Select a new seat...'}</option>
                  {targetAvailableSeats.map(s => (
                    <option key={s._id} value={s._id}>{s.seatNumber} (Row: {s.row})</option>
                  ))}
                </select>
                {moveSessionData.newSessionId && targetAvailableSeats.length === 0 && !isFetchingTargetSeats && (
                  <p style={{ color: 'red', fontSize: '0.85rem' }}>No active/available seats in target session.</p>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Reason for Session Move</label>
                <input 
                  type="text" 
                  value={moveSessionData.reason} 
                  onChange={e => setMoveSessionData({...moveSessionData, reason: e.target.value})} 
                  required 
                  placeholder="e.g. Schedule conflict, Emergency"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" disabled={!moveSessionData.newSeatId} style={{ padding: '0.5rem 1rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: moveSessionData.newSeatId ? 'pointer' : 'not-allowed' }}>Confirm Move</button>
                <button type="button" onClick={() => { setShowMoveSessionModal(false); setSelectedSeatDetails(null); }} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
