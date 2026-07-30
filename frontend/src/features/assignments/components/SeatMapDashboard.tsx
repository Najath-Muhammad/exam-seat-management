import React from 'react';
import { SeatMapData } from '../../types/seatMap.types';
import { InitialAllocationResult } from '../../types/seatAssignment.types';

interface Props {
  seatMap: SeatMapData;
  isAllocating: boolean;
  allocationResult: InitialAllocationResult | null;
  onManualAssignClick: () => void;
  onInitialAllocationClick: () => void;
  onCandidateAssignClick: (candidateId: string) => void;
}

export const SeatMapDashboard: React.FC<Props> = ({ seatMap, isAllocating, allocationResult, onManualAssignClick, onInitialAllocationClick, onCandidateAssignClick }) => {
  return (
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
        <button onClick={onManualAssignClick} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Manual Assign Seat
        </button>
        <button onClick={onInitialAllocationClick} disabled={isAllocating || seatMap.summary.unassignedCandidates === 0} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
                  onClick={() => onCandidateAssignClick(c._id)}
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
  );
};
