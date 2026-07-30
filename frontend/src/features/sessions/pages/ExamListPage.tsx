import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Exam } from '../types/session.types';
import { sessionApi } from '../services/sessionApi';

export const ExamListPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await sessionApi.getExams();
        setExams(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (isLoading) return <div>Loading exams...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Exams</h2>
      {exams.length === 0 ? (
        <p>No exams found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {exams.map(exam => (
            <li key={exam._id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
              <h3>{exam.name}</h3>
              <p>{exam.description}</p>
              <Link to={`/admin/exams/${exam._id}/sessions`} style={{ color: '#007bff' }}>View Sessions</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
