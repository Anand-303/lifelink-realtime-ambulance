import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
  TextField,
  Box,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import * as bloodDonationService from '../../services/bloodDonationService';
import { BloodRequest, User } from '../../types';

// Extend the BloodRequest type to include any additional fields from the API
interface ExtendedBloodRequest extends Omit<BloodRequest, 'requester'> {
  // Make requester accept both string and User types
  requester: string | User;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  pending: 'default',
  approved: 'primary',
  fulfilled: 'success',
  rejected: 'error',
  partially_fulfilled: 'warning',
  cancelled: 'error'
} as const;

const BloodRequestsAdmin: React.FC = () => {
  const [requests, setRequests] = useState<ExtendedBloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  type StatusFilter = 'all' | 'pending' | 'approved' | 'fulfilled' | 'rejected';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRequest, setSelectedRequest] = useState<ExtendedBloodRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bloodDonationService.getBloodRequests();
      // Filter the data based on status if needed
      const filteredData = statusFilter === 'all' 
        ? data 
        : data.filter((req) => req.status === statusFilter);
      setRequests(filteredData as ExtendedBloodRequest[]);
    } catch (error) {
      console.error('Error loading requests:', error);
      // Handle error (show notification, etc.)
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleStatusChange = (event: SelectChangeEvent) => {
    const value = event.target.value as 'pending' | 'approved' | 'fulfilled' | 'rejected';
    setStatusFilter(value);
  };

  const handleUpdateStatus = async (newStatus: 'approved' | 'fulfilled' | 'rejected') => {
    if (!selectedRequest) return;
    
    try {
      setUpdating(true);
      const updatedRequest = await bloodDonationService.updateBloodRequestStatus(
        selectedRequest._id,
        newStatus,
        notes
      );
      
      // Update local state with the returned request
      setRequests(prev => prev.map(req => {
        if (req._id === selectedRequest._id) {
          // Ensure we're creating a properly typed object
          return {
            ...req,
            ...updatedRequest,
            // Ensure we maintain the correct requester type
            requester: req.requester
          } as ExtendedBloodRequest;
        }
        return req;
      }));
      
      setSelectedRequest(null);
      setNotes('');
    } catch (error) {
      console.error('Error updating request status:', error);
      // Handle error
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDialog = (request: BloodRequest) => {
    // Cast to ExtendedBloodRequest since we know it will have the required fields
    setSelectedRequest(request as unknown as ExtendedBloodRequest);
    setNotes((request as any).adminNotes || '');
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setNotes('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blood Donation Requests
        </Typography>
        
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            label="Filter by Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="fulfilled">Fulfilled</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Blood Group</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell>Quantity (ml)</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>{request.patientName}</TableCell>
                    <TableCell>{request.bloodGroup}</TableCell>
                    <TableCell>{request.hospital}</TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>{request.urgency}</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={statusColors[request.status as keyof typeof statusColors]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenDialog(request)}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Update Status Dialog */}
      <Dialog open={!!selectedRequest} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">
              <strong>Patient:</strong> {selectedRequest?.patientName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Blood Group:</strong> {selectedRequest?.bloodGroup}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Hospital:</strong> {selectedRequest?.hospital}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Current Status:</strong>{' '}
              <Chip 
                label={selectedRequest?.status} 
                color={statusColors[(selectedRequest?.status || 'pending') as keyof typeof statusColors]}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Typography>
          </Box>
          
          <TextField
            label="Admin Notes"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this request..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={updating}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleUpdateStatus('rejected')} 
            color="error"
            disabled={updating}
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleUpdateStatus('approved')} 
            color="primary"
            disabled={updating}
          >
            Approve
          </Button>
          <Button 
            onClick={() => handleUpdateStatus('fulfilled')} 
            color="success"
            variant="contained"
            disabled={updating}
          >
            Mark as Fulfilled
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BloodRequestsAdmin;
