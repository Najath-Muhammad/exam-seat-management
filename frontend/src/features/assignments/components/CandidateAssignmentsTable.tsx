import React from 'react';
import { SeatAssignment, AssignmentStatus } from '../types/seatAssignment.types';
import { Candidate } from '../../candidates/types/candidate.types';
import { Seat } from '../../seats/types/seat.types';

interface CandidateListItem {
  candidateId: string;
  registrationNumber: string;
  name: string;
  isAssigned: boolean;
  seatNumber: string | null;
  assignmentId: string | null;
}

interface Props {
  allCandidatesList: CandidateListItem[];
  historyAssignments: SeatAssignment[];
  onManualAssignClick: (candidateId: string) => void;
  onReassignClick: (assignmentId: string) => void;
  onMoveSessionClick: (assignmentId: string) => void;
  onCancelAssignmentClick: (assignmentId: string) => void;
  onRegisterComplaintClick: (candidateId: string) => void;
}

export const CandidateAssignmentsTable: React.FC<Props> = ({ 
  allCandidatesList, historyAssignments, onManualAssignClick, onReassignClick, onMoveSessionClick, onCancelAssignmentClick, onRegisterComplaintClick
}) => {
  return (
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
          {allCandidatesList.map(c => (
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
                    onClick={() => onManualAssignClick(c.candidateId)}
                    style={{ padding: '0.25rem 0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Assign Seat
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onReassignClick(c.assignmentId!)}
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Reassign
                    </button>
                    <button 
                      onClick={() => onMoveSessionClick(c.assignmentId!)}
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Transfer
                    </button>
                    <button 
                      onClick={() => onCancelAssignmentClick(c.assignmentId!)}
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div style={{ marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => onRegisterComplaintClick(c.candidateId)}
                    style={{ padding: '0.25rem 0.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Log Complaint
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
  );
};
