import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { UserRole } from './types/auth.types';

export let io: SocketServer;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Authorization Check
      if (decoded.role !== UserRole.ADMIN) {
        return next(new Error('Authorization error: Admin role required'));
      }

      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Admin connected via Socket.IO: ${socket.id}`);

    // Join global admin room
    socket.join('admin-room');

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const emitEvent = (event: string, payload: any, room: string = 'admin-room') => {
  if (io) {
    io.to(room).emit(event, payload);
  }
};
