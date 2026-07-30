import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/admin');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        // Validation errors might be in err.response.data.errors array
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
           setError(err.response.data.errors[0].message);
        } else {
           setError(err.response.data.message);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Admin Login</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ width: '100%', padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
