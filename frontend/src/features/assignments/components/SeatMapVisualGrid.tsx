import React, { useState } from 'react';
import { SeatMapItem } from '../types/seatMap.types';import { TAny } from '../../../types/any';


interface Props {
  seats: SeatMapItem[];
  onSeatClick: (seat: SeatMapItem) => void;
}

export const SeatMapVisualGrid: React.FC<Props> = ({ seats, onSeatClick }) => {
  const [mapFilter, setMapFilter] = useState<'ALL' | 'OCCUPIED' | 'VACANT' | 'MAINTENANCE' | 'INACTIVE'>('ALL');
  const [mapSearch, setMapSearch] = useState('');

  const filteredSeats = seats.filter(s => {
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
        <h3 style={{ margin: 0 }}>Visual Seat Map</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={mapFilter} onChange={e => setMapFilter(e.target.value as TAny)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
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
                    onClick={() => onSeatClick(seat)}
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
  );
};
