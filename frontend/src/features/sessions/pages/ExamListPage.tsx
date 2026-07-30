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
      } catch (err: TAny) {
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
    <div className="page-container">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Exams</h2>
      </div>
      
      {exams.length === 0 ? (
        <p className="text-muted">No exams found.</p>
      ) : (
        <div className="grid-cards">
          {exams.map(exam => (
            <div key={exam._id} className="card dashboard-card">
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{exam.name}</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{exam.description}</p>
              <Link to={`/admin/exams/${exam._id}/sessions`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                View Sessions
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
