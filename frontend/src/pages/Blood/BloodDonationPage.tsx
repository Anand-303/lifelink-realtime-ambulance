import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppSelector } from '../../redux/hooks';
import { getBloodInventory, getDonors, registerAsDonor } from '../../services/bloodDonationService';
import { bloodDonationService } from '../../services/api';
import Grid from '../../components/CustomGrid';
import { 
  BloodRequest as BloodRequestType,
  TabPanelProps as TabPanelPropsType
} from '../../types/bloodDonation';


interface BloodRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // Called after successful submission
  isMobile: boolean;
}

interface BloodRequestFormData {
  patientName: string;
  patientAge: string;
  bloodGroup: string;
  units: string;
  hospital: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  contactNumber: string;
  reason: string;
}


const BloodRequestForm: React.FC<BloodRequestFormProps> = ({ open, onClose, onSuccess, isMobile }) => {
  const [formData, setFormData] = useState<BloodRequestFormData>({
    patientName: '',
    patientAge: '',
    bloodGroup: '',
    units: '1',
    hospital: '',
    urgency: 'medium',
    contactNumber: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>
  ) => {
    const target = e.target as { name: keyof BloodRequestFormData; value: string };
    if (!target.name) return;
    setFormData(prev => ({
      ...prev,
      [target.name]: target.value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.patientName.trim()) {
      setError('Patient name is required');
      return false;
    }
    
    const age = parseInt(formData.patientAge, 10);
    if (isNaN(age) || age < 1 || age > 120) {
      setError('Please enter a valid age (1-120)');
      return false;
    }

    if (!formData.bloodGroup) {
      setError('Blood group is required');
      return false;
    }

    const units = parseInt(formData.units, 10);
    if (isNaN(units) || units < 1) {
      setError('Please enter a valid number of units');
      return false;
    }

    if (!formData.hospital.trim()) {
      setError('Hospital name is required');
      return false;
    }

    if (!/^\+?[0-9\s-]{10,}$/.test(formData.contactNumber)) {
      setError('Please enter a valid contact number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare request data
      const requestData = {
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge, 10),
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units, 10),
        hospital: formData.hospital,
        urgency: formData.urgency,
        contactNumber: formData.contactNumber,
        reason: formData.reason || undefined,
      };

      // Submit to server using the API service
      await bloodDonationService.requestBlood(requestData);

      // Reset form
      setFormData({
        patientName: '',
        patientAge: '',
        bloodGroup: '',
        units: '1',
        hospital: '',
        urgency: 'medium',
        contactNumber: '',
        reason: ''
      });

      // Show success confirmation dialog
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error submitting blood request:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to submit blood request. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    onClose();
    // Call onSuccess after a small delay to ensure dialog closes first
    setTimeout(() => {
      onSuccess();
    }, 100);
  };

  return (
    <>
      {/* Success Confirmation Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            textAlign: 'center',
            p: 3
          }
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: '#4caf50',
                mb: 2,
                animation: 'scaleIn 0.3s ease-out',
                '@keyframes scaleIn': {
                  '0%': {
                    transform: 'scale(0)',
                    opacity: 0
                  },
                  '50%': {
                    transform: 'scale(1.2)'
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                }
              }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#4caf50' }}>
              Request Submitted!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Your blood request has been successfully submitted and will be reviewed by the admin.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSuccessDialogClose}
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Form Dialog */}
      <Dialog
        open={open && !showSuccessDialog}
        onClose={!loading ? () => {
          setShowSuccessDialog(false);
          onClose();
        } : undefined}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
      <form onSubmit={handleSubmit}>
        <DialogTitle>New Blood Request</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }} component="div">
            <Grid item xs={12} sm={6} component="div">
              <TextField
                fullWidth
                label="Patient Name"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                margin="normal"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                fullWidth
                label="Patient Age"
                name="patientAge"
                type="number"
                value={formData.patientAge}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ min: 1, max: 120 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => handleChange(e as SelectChangeEvent<unknown>)}
                  label="Blood Group"
                  disabled={loading}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                fullWidth
                label="Units Required"
                name="units"
                type="number"
                value={formData.units}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ min: 1 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hospital"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                required
                margin="normal"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Urgency</InputLabel>
                <Select
                  name="urgency"
                  value={formData.urgency}
                  onChange={(e) => handleChange(e as SelectChangeEvent<unknown>)}
                  label="Urgency"
                  disabled={loading}
                >
                  {['low', 'medium', 'high', 'critical'].map(level => (
                    <MenuItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} component="div">
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                margin="normal"
                disabled={loading}
                placeholder="+1234567890"
              />
            </Grid>
            <Grid item xs={12} component="div">
              <TextField
                fullWidth
                label="Reason for Request"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                multiline
                rows={3}
                margin="normal"
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
    </>
  );
};

interface BloodInventoryItem {
  _id: string;
  bloodGroup: string;
  units: number;
  lastUpdated: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

// User interface is now imported from types.ts

// Simple date formatter
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

function TabPanel(props: TabPanelPropsType) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`blood-tabpanel-${index}`}
      aria-labelledby={`blood-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `blood-tab-${index}`,
    'aria-controls': `blood-tabpanel-${index}`,
  };
}

interface BloodRequest {
  _id: string;
  patientName: string;
  patientAge: number;
  bloodGroup: string;
  units: number;
  hospital: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  contactNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const BloodDonationPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isAdmin = user?.role === 'admin';
  
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [, setLoadingInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [openRequestDialog, setOpenRequestDialog] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view this page');
      setLoading(false);
      setLoadingRequests(false);
      setLoadingDonors(false);
      setLoadingInventory(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load donors
        setLoadingDonors(true);
        try {
          const donorsData = await getDonors(token);
          if (isMounted) {
            setDonors(Array.isArray(donorsData) ? donorsData : []);
          }
        } catch (err) {
          console.error('Error loading donors:', err);
          if (isMounted) {
            setSnackbar({
              open: true,
              message: 'Failed to load donors. Please try again later.',
              severity: 'error'
            });
          }
        } finally {
          if (isMounted) setLoadingDonors(false);
        }

        // Load inventory
        setLoadingInventory(true);
        try {
          const inventoryData = await getBloodInventory(token);
          if (isMounted) {
            setInventory(inventoryData || []);
          }
        } catch (err) {
          console.error('Error loading inventory:', err);
        } finally {
          if (isMounted) setLoadingInventory(false);
        }

        // Fetch user's blood requests
        setLoadingRequests(true);
        try {
          const userRequests = await fetchUserBloodRequests();
          if (isMounted) {
            setRequests(userRequests);
          }
        } catch (err) {
          console.error('Error loading blood requests:', err);
          if (isMounted) {
            setSnackbar({
              open: true,
              message: 'Failed to load blood requests',
              severity: 'error'
            });
          }
        } finally {
          if (isMounted) setLoadingRequests(false);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        if (isMounted) {
          setError('Failed to load data. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 2) { // My Requests tab
      fetchUserBloodRequests()
        .then(data => setRequests(data))
        .catch(err => setError(err instanceof Error ? err.message : 'Failed to load requests'));
    }
  };

  // Register as donor
  const handleRegisterAsDonor = async (): Promise<void> => {
    if (!user) {
      setError('You must be logged in to register as a donor');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      await registerAsDonor(user._id, token);
      // Reload donors list
      const donorsData = await getDonors(token);
      setDonors(Array.isArray(donorsData) ? donorsData : []);
      setSnackbar({
        open: true,
        message: 'Successfully registered as a blood donor!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error registering as donor:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to register as donor',
        severity: 'error'
      });
    }
  };

  // Function to fetch user's blood requests with enhanced error handling
  const fetchUserBloodRequests = async (): Promise<BloodRequestType[]> => {
    console.log('[DEBUG] Starting to fetch blood requests...');
    const token = localStorage.getItem('token');
    
    if (!token) {
      const errorMsg = 'No authentication token found. Please log in again.';
      console.error('[ERROR]', errorMsg);
      setError(errorMsg);
      return [];
    }

    try {
      // Skip external network test as it might be blocked by browser security
      console.log('[DEBUG] Skipping external network test...');
      
      // Instead, try to access a local resource to verify basic connectivity
      console.log('[DEBUG] Testing local connectivity...');
      try {
        await fetch('/'); // Try to access the root of the current domain
        console.log('[DEBUG] Local connectivity test passed');
      } catch (localError) {
        console.warn('[WARN] Local connectivity test failed, but proceeding anyway');
      }
      
      // Set the backend URL and correct base path
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      // Update to use the correct base path from server.ts
      const apiUrl = `${apiBaseUrl}/api/blood-donation/request/user`;
      
      console.log('[DEBUG] Using API URL:', apiUrl);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('[DEBUG] Backend URL:', apiBaseUrl);
      console.log('[DEBUG] Full API URL:', apiUrl);
      console.log('[DEBUG] Using API URL:', apiUrl);
      
      // Test basic server connectivity without auth
      console.log('[DEBUG] Testing server connectivity...');
      try {
        console.log('[DEBUG] Making request to:', apiUrl);
        
        // Add a timestamp to track request timing
        const startTime = Date.now();
        
        try {
          const serverTest = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            credentials: 'include' // Include cookies if needed
          });
          
          const endTime = Date.now();
          console.log(`[DEBUG] Request completed in ${endTime - startTime}ms`);
          
          console.log('[DEBUG] Server response status:', serverTest.status, serverTest.statusText);
          console.log('[DEBUG] Response headers:', Object.fromEntries(serverTest.headers.entries()));
          
          // Try to read the response as text first to avoid JSON parsing errors
          const responseText = await serverTest.text();
          console.log('[DEBUG] Raw response:', responseText);
          
          if (serverTest.status === 401) {
            console.log('[DEBUG] Server requires authentication');
            // Try to parse as JSON if possible
            try {
              const jsonResponse = JSON.parse(responseText);
              console.log('[DEBUG] Authentication required:', jsonResponse);
            } catch (e) {
              console.log('[DEBUG] Could not parse error response as JSON');
            }
          } else if (!serverTest.ok) {
            console.error('[ERROR] Server error response:', {
              status: serverTest.status,
              statusText: serverTest.statusText,
              headers: Object.fromEntries(serverTest.headers.entries()),
              body: responseText
            });
            throw new Error(`Server returned ${serverTest.status}: ${serverTest.statusText}`);
          }
          
          // If we got here, the request was successful
          console.log('[DEBUG] Successfully connected to the server');
          
        } catch (error) {
          const fetchError = error as Error;
          console.error('[ERROR] Fetch error details:', {
            name: fetchError.name,
            message: fetchError.message,
            stack: fetchError.stack
          });
          throw fetchError;
        }
      } catch (serverError) {
        console.error('[ERROR] Failed to connect to server:', serverError);
        throw new Error('Could not connect to the server. Please make sure the backend is running.');
      }
      
      // Now make the authenticated request
      console.log('[DEBUG] Making authenticated request...');
      const timestamp = new Date().getTime();
      const urlWithCacheBust = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}_=${timestamp}`;
      
      console.log('[DEBUG] Final request URL:', urlWithCacheBust);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(urlWithCacheBust, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      console.log('[DEBUG] Response status:', response.status, response.statusText);
      console.log('[DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMsg = `Request failed with status ${response.status} ${response.statusText}`;
        console.error('[ERROR] Request failed:', errorMsg);
        
        // Handle common error statuses
        if (response.status === 401) {
          errorMsg = 'Session expired. Please log in again.';
          // Optionally redirect to login
          // navigate('/login');
        } else if (response.status === 403) {
          errorMsg = 'You do not have permission to access this resource.';
        } else if (response.status === 404) {
          errorMsg = 'The requested resource was not found.';
        } else if (response.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        // Try to get more details from the response
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('[ERROR] API Error Response:', errorData);
            errorMsg = errorData.message || errorData.error || errorMsg;
          } else {
            const text = await response.text();
            console.error('[ERROR] Non-JSON error response:', text);
            if (text) errorMsg = `${errorMsg} (${text})`;
          }
        } catch (e) {
          console.error('[ERROR] Failed to parse error response:', e);
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Ensure the data matches the BloodRequestType
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      // Map the response to ensure it matches BloodRequestType
      return data.map((item: any) => ({
        _id: item._id || '',
        patientName: item.patientName || '',
        patientAge: Number(item.patientAge) || 0,
        bloodGroup: item.bloodGroup || '',
        units: Number(item.units) || 1,
        hospital: item.hospital || '',
        urgency: ['low', 'medium', 'high', 'critical'].includes(item.urgency) 
          ? item.urgency as 'low' | 'medium' | 'high' | 'critical'
          : 'medium',
        contactNumber: item.contactNumber || '',
        status: ['pending', 'approved', 'rejected', 'completed'].includes(item.status)
          ? item.status as 'pending' | 'approved' | 'rejected' | 'completed'
          : 'pending',
        reason: item.reason || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load blood requests',
        severity: 'error'
      });
      return [];
    }
  };

  const renderBloodAvailability = () => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    return (
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Blood Availability
        </Typography>
        <Grid container spacing={2} component="div">
          {bloodGroups.map((group) => {
            const inventoryItem = inventory.find(item => item.bloodGroup === group) || {
              _id: '',
              bloodGroup: group,
              units: 0,
              lastUpdated: new Date().toISOString(),
              updatedBy: null
            };
            
            const isLowStock = inventoryItem.units < 5;
            const isCritical = inventoryItem.units === 0;
            
            return (
              <Grid item xs={6} sm={4} md={3} key={group} component="div">
                <Card
                  sx={{
                    textAlign: 'center',
                    border: `2px solid ${
                      isCritical ? 'red' : isLowStock ? 'orange' : 'transparent'
                    }`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {group}
                    </Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>
                      {inventoryItem.units}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isCritical ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Last updated: {formatDate(inventoryItem.lastUpdated)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>
    );
  };

  const renderMyRequests = () => {
    if (loadingRequests) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert 
            severity="error" 
            action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchUserBloodRequests()
                      .then(data => setRequests(data))
                      .catch(err => setError(err.message))
                      .finally(() => setLoading(false));
                  }}
                >
                  Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Box>
      );
    }

    if (requests.length === 0) {
      return <Typography>No blood requests found.</Typography>;
    }

    return (
      <TableContainer component={Paper}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell align="center">Blood Group</TableCell>
              <TableCell align="center">Units</TableCell>
              <TableCell>Hospital</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              {isAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {request.patientName}
                </TableCell>
                <TableCell align="center">{request.bloodGroup}</TableCell>
                <TableCell align="center">{request.units}</TableCell>
                <TableCell>{request.hospital}</TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={
                      request.status === 'approved' ? 'success' :
                      request.status === 'rejected' ? 'error' :
                      request.status === 'pending' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                {isAdmin && (
                  <TableCell>
                    {request.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleUpdateRequestStatus(request._id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleUpdateRequestStatus(request._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    {request.status !== 'pending' && (
                      <Typography variant="body2" color="textSecondary">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </Typography>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const handleCloseRequestDialog = () => {
    setOpenRequestDialog(false);
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/blood/requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update request status');
      }

      // Refresh the requests list
      const userRequests = await fetchUserBloodRequests();
      setRequests(userRequests);

      setSnackbar({
        open: true,
        message: `Request ${status} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to update request status',
        severity: 'error'
      });
    }
  };


  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 3, mb: 4, opacity: loading ? 0.92 : 1, transition: 'opacity 0.2s' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={28} aria-label="Loading page data" />
          </Box>
        )}
        <Typography variant="h4" component="h1" gutterBottom>
          Blood Donation & Requests
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="blood donation tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Blood Availability" {...a11yProps(0)} />
            <Tab label="Donors" {...a11yProps(1)} />
            <Tab label="My Requests" {...a11yProps(2)} />
          </Tabs>
        </Box>

      <TabPanel value={tabValue} index={0}>
        {renderBloodAvailability()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            Registered Donors
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegisterAsDonor}
            disabled={loadingDonors || donors.some(d => d.userId === user?._id)}
          >
            {donors.some(d => d.userId === user?._id) ? 'Already Registered' : 'Register as Donor'}
          </Button>
        </Box>
        
        {loadingDonors ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Last Donation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donors.map((donor) => (
                  <TableRow key={donor._id}>
                    <TableCell>{donor.name}</TableCell>
                    <TableCell>{donor.bloodGroup}</TableCell>
                    <TableCell>{donor.phone}</TableCell>
                    <TableCell>{donor.lastDonation ? formatDate(donor.lastDonation) : 'Never'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            My Blood Requests
          </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenRequestDialog(true)}
            >
              New Request
            </Button>
          </Box>
          {renderMyRequests()}
        </TabPanel>

        {/* Blood Request Dialog */}
        <BloodRequestForm
          open={openRequestDialog}
          onClose={handleCloseRequestDialog}
          onSuccess={async () => {
            // Request has already been submitted to server in the form
            // Just refresh the requests list and show success message
            setSnackbar({
              open: true,
              message: 'Blood request submitted successfully!',
              severity: 'success'
            });
            
            // Refresh the requests list
            try {
              const userRequests = await fetchUserBloodRequests();
              setRequests(userRequests);
            } catch (err) {
              console.error('Error fetching requests:', err);
            }
          }}
          isMobile={isMobile}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Box>
    </Container>
  );
};

export default BloodDonationPage;