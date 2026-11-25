import React, { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { statusService } from '../../services/api';

const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await statusService.checkApiStatus();
        setStatus(result.status === 'success' ? 'online' : 'offline');
      } catch (error) {
        setStatus('offline');
      }
    };

    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      {status === 'checking' ? (
        <Chip label="Checking API..." color="default" size="small" />
      ) : status === 'online' ? (
        <Chip 
          icon={<CheckCircleIcon />} 
          label="API Online" 
          color="success" 
          size="small" 
          sx={{ '& .MuiChip-icon': { color: 'inherit' } }}
        />
      ) : (
        <Chip 
          icon={<ErrorIcon />} 
          label="API Offline" 
          color="error" 
          size="small" 
          sx={{ '& .MuiChip-icon': { color: 'inherit' } }}
        />
      )}
    </Box>
  );
};

export default ApiStatus;