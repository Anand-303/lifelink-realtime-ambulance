import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Delete, Edit, Bloodtype as BloodtypeIcon } from '@mui/icons-material';
import { useAppSelector } from '../../redux/hooks';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface BloodInventory {
  _id: string;
  bloodGroup: string;
  units: number;
  lastUpdated: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;  // Made updatedBy nullable
}

interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  createdAt: string;
  updatedAt: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

const BloodManagement: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [tabValue, setTabValue] = useState(0);
  
  // Inventory state
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [units, setUnits] = useState<number>(0);
  const [bloodGroup, setBloodGroup] = useState('A+');
  
  // Requests state
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // UI state
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Fetch blood inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { bloodInventoryService } = await import('../../services/api');
      const data = await bloodInventoryService.getBloodInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching blood inventory:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch blood inventory', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch blood requests
  const fetchRequests = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/blood-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch blood requests', 
        severity: 'error' 
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchRequests();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (group: string | null = null) => {
    if (group) {
      const item = inventory.find(item => item.bloodGroup === group);
      setEditingGroup(group);
      setUnits(item?.units || 0);
      setBloodGroup(group);
    } else {
      setEditingGroup(null);
      setUnits(0);
      setBloodGroup('A+');
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const { bloodInventoryService } = await import('../../services/api');
      const result = await bloodInventoryService.updateBloodInventory(bloodGroup, Number(units));
      
      // Update local state
      setInventory(prev => {
        const existing = prev.find(item => item.bloodGroup === bloodGroup);
        if (existing) {
          return prev.map(item => 
            item.bloodGroup === bloodGroup ? result.data : item
          );
        } else {
          return [...prev, result.data].sort((a, b) => 
            a.bloodGroup.localeCompare(b.bloodGroup)
          );
        }
      });

      setOpenDialog(false);
      setSnackbar({ 
        open: true, 
        message: result.message || 'Inventory updated successfully', 
        severity: 'success' 
      });
      // Refresh inventory to get latest data
      fetchInventory();
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update inventory', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (group: string) => {
    if (window.confirm(`Are you sure you want to clear ${group} inventory?`)) {
      try {
        const { bloodInventoryService } = await import('../../services/api');
        await bloodInventoryService.deleteBloodInventory(group);

        // Update local state to reflect the deletion (set units to 0)
        setInventory(prev => 
          prev.map(item => 
            item.bloodGroup === group 
              ? { 
                  ...item, 
                  units: 0, 
                  lastUpdated: new Date().toISOString(),
                  updatedBy: user 
                } 
              : item
          )
        );

        setSnackbar({ 
          open: true, 
          message: `${group} inventory cleared successfully`, 
          severity: 'success' 
        });
        // Refresh inventory to get latest data
        fetchInventory();
      } catch (error: any) {
        console.error('Error deleting inventory:', error);
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Failed to clear inventory', 
          severity: 'error' 
        });
      }
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'approved' | 'rejected' | 'fulfilled') => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/blood-requests/${requestId}/status`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      const updatedRequest = await response.json();
      
      setRequests(prev => 
        prev.map(req => 
          req._id === requestId ? updatedRequest : req
        )
      );

      setSnackbar({ 
        open: true, 
        message: `Request ${status} successfully`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update request status', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/blood-requests/${requestId}`, 
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete request');
        }

        setRequests(prev => prev.filter(req => req._id !== requestId));
        
        setSnackbar({ 
          open: true, 
          message: 'Request deleted successfully', 
          severity: 'success' 
        });
      } catch (error) {
        console.error('Error deleting request:', error);
        setSnackbar({ 
          open: true, 
          message: 'Failed to delete request', 
          severity: 'error' 
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'fulfilled':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Blood Management
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Blood Inventory" />
          <Tab label="Blood Requests" />
        </Tabs>
      </Box>

      {/* Blood Inventory Tab */}
      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Blood Inventory</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<BloodtypeIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Blood Group
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Blood Group</TableCell>
                    <TableCell align="right">Units Available</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Updated By</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {BLOOD_GROUPS.map(group => {
                    const item = inventory.find(i => i.bloodGroup === group) || { 
                      bloodGroup: group, 
                      units: 0,
                      lastUpdated: new Date().toISOString(),
                      updatedBy: { name: 'System' }
                    };
                    
                    return (
                      <TableRow key={group}>
                        <TableCell>{group}</TableCell>
                        <TableCell align="right">{item.units}</TableCell>
                        <TableCell>
                          {new Date(item.lastUpdated).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {item.updatedBy?.name || 'System'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(group)}
                            size="small"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(group)}
                            disabled={!item.units}
                            size="small"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Blood Requests Tab */}
      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Blood Requests</Typography>
          </Box>

          {loadingRequests ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Blood Group</TableCell>
                    <TableCell align="right">Units</TableCell>
                    <TableCell>Hospital</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No blood requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>{request.patientName}</TableCell>
                        <TableCell>{request.bloodGroup}</TableCell>
                        <TableCell align="right">{request.units}</TableCell>
                        <TableCell>{request.hospital}</TableCell>
                        <TableCell>
                          <Box 
                            component="span" 
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: `${getStatusColor(request.status)}.light`,
                              color: `${getStatusColor(request.status)}.dark`,
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                              display: 'inline-block',
                              textTransform: 'capitalize'
                            }}
                          >
                            {request.status}
                          </Box>
                        </TableCell>
                        <TableCell>{request.requestedBy?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                onClick={() => handleUpdateRequestStatus(request._id, 'approved')}
                                sx={{ minWidth: '80px', mr: 1 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleUpdateRequestStatus(request._id, 'rejected')}
                                sx={{ minWidth: '80px', mr: 1 }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <Button
                              size="small"
                              color="info"
                              onClick={() => handleUpdateRequestStatus(request._id, 'fulfilled')}
                              sx={{ minWidth: '80px', mr: 1 }}
                            >
                              Mark Fulfilled
                            </Button>
                          )}
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteRequest(request._id)}
                            size="small"
                            disabled={request.status === 'fulfilled'}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGroup ? `Edit ${editingGroup} Inventory` : 'Add Blood Group'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Blood Group</InputLabel>
              <Select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as string)}
                disabled={!!editingGroup}
                label="Blood Group"
              >
                {BLOOD_GROUPS.map(group => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Units Available"
              type="number"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              inputProps={{ min: 0, step: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BloodManagement;
