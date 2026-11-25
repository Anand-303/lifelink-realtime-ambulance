import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL);

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Function to emit ambulance location updates
  const emitAmbulanceLocation = (ambulanceId: string, location: { latitude: number; longitude: number }) => {
    if (socketRef.current) {
      socketRef.current.emit('updateAmbulanceLocation', {
        ambulanceId,
        location,
      });
    }
  };

  // Function to subscribe to ambulance location updates
  const subscribeToAmbulanceUpdates = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('ambulanceLocationUpdated', callback);
    }

    // Return unsubscribe function
    return () => {
      if (socketRef.current) {
        socketRef.current.off('ambulanceLocationUpdated', callback);
      }
    };
  };

  return {
    socket: socketRef.current,
    emitAmbulanceLocation,
    subscribeToAmbulanceUpdates,
  };
};