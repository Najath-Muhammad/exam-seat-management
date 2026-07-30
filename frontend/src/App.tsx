import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
