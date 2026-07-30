import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../features/auth/hooks/useAuth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Connect to the backend
      const newSocket = io('http://localhost:5000', {
        auth: { token: accessToken },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (!isAuthenticated && socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, accessToken]); // Only re-run when auth changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
