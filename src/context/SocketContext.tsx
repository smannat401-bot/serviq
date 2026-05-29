import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('serviq_user') || '{}');
    
    if (user._id) {
      const socketInstance = io(API_URL);
      
      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
        socketInstance.emit('join', user._id);

        // Request Notification Permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      });

      socketInstance.on('new_booking', (data) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Booking Request', {
            body: data.notification?.messageEn || 'You have a new booking request.',
            icon: '/pwa-192x192.png'
          });
        }
      });

      socketInstance.on('booking_status_update', (data) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Booking Update', {
            body: `Booking status changed to ${data.status}`,
            icon: '/pwa-192x192.png'
          });
        }
      });

      socketInstance.on('receive_message', (message) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Message', {
            body: message.text,
            icon: '/pwa-192x192.png'
          });
        }
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
