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
    } catch (err: TAny) {
      if (err.response && err.response.data && err.response.data.message) {
        
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
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form card">
        <div className="login-header">
           <h2>Admin Portal</h2>
           <p className="text-muted">Sign in to manage exam seating</p>
        </div>
        
        {error && <div className="alert-error">{error}</div>}
        
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary full-width mt-4"
        >
          {isLoading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};
