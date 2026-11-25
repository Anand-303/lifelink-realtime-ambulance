import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Bloodtype as BloodIcon,
  Campaign as CampaignIcon,
  DirectionsCar as AmbulanceIcon,
  Assignment as RequestIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../redux/hooks';
import { ambulanceService, bloodDonationService, campaignService, bloodInventoryService } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

interface AmbulanceRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  patientName: string;
  patientPhone?: string;
  needsBlood?: boolean;
  urgency?: 'low' | 'medium' | 'critical';
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination?: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  status: string;
  ambulance?: any;
  emergencyDetails?: string;
  createdAt: string;
}

interface BloodRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  patientName: string;
  patientAge?: number;
  bloodGroup: string;
  quantity: number;
  hospital: string;
  urgency: string;
  status: string;
  requiredBy?: string;
  medicalNotes?: string;
  createdAt: string;
}

interface Ambulance {
  _id: string;
  registrationNumber: string;
  driver: {
    name: string;
    phone: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    updatedAt: Date;
  };
  status: string;
  capacity?: number;
}

interface AmbulanceFormData {
  registrationNumber: string;
  capacity: number;
  driver: {
    name: string;
    phone: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    updatedAt?: Date;
  };
  status: string;
}

interface Campaign {
  _id: string;
  title: string;
  description: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  startDate: string;
  endDate: string;
  bloodGroupsNeeded: string[];
  status: string;
  image?: string;
  participants: any[];
  createdAt: string;
}

const AdminDashboardNew: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [tabValue, setTabValue] = useState(0);
  
  // Ambulance requests state
  const [ambulanceRequests, setAmbulanceRequests] = useState<AmbulanceRequest[]>([]);
  const [loadingAmbulanceRequests, setLoadingAmbulanceRequests] = useState(true);
  
  // Blood requests state
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loadingBloodRequests, setLoadingBloodRequests] = useState(true);
  
  // Ambulances state
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loadingAmbulances, setLoadingAmbulances] = useState(true);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [openAmbulanceDialog, setOpenAmbulanceDialog] = useState(false);
  const [ambulanceFormData, setAmbulanceFormData] = useState<AmbulanceFormData>({
    registrationNumber: '',
    capacity: 4,
    driver: {
      name: '',
      phone: ''
    },
    location: {
      latitude: 0,
      longitude: 0,
      updatedAt: new Date()
    },
    status: 'available'
  });
  
  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
  const [campaignFormData, setCampaignFormData] = useState({
    title: '',
    description: '',
    address: '',
    startDate: '',
    endDate: '',
    bloodGroupsNeeded: '',
    image: ''
  });
  
  // Blood Inventory state
  const [bloodInventory, setBloodInventory] = useState<any[]>([]);
  const [loadingBloodInventory, setLoadingBloodInventory] = useState(true);
  const [openBloodInventoryDialog, setOpenBloodInventoryDialog] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null);
  const [bloodInventoryFormData, setBloodInventoryFormData] = useState({
    bloodGroup: 'A+',
    units: 0
  });
  
  // Error and success handling
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Allocation state
  const [openAllocateDialog, setOpenAllocateDialog] = useState(false);
  const [allocateForRequestId, setAllocateForRequestId] = useState<string | null>(null);
  const [allocateAmbulanceId, setAllocateAmbulanceId] = useState<string>('');
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Load data based on active tab
  useEffect(() => {
    if (tabValue === 0) {
      loadAmbulanceRequests();
    } else if (tabValue === 1) {
      loadBloodRequests();
    } else if (tabValue === 2) {
      loadAmbulances();
    } else if (tabValue === 3) {
      loadCampaigns();
    } else if (tabValue === 4) {
      loadBloodInventory();
    }
  }, [tabValue]);
  
  // Load ambulance requests
  const loadAmbulanceRequests = async () => {
    setLoadingAmbulanceRequests(true);
    try {
      const response = await ambulanceService.getAllAmbulanceRequests();
      setAmbulanceRequests(Array.isArray(response) ? response : []);
      if (!Array.isArray(response)) {
        console.warn('Unexpected ambulance requests response shape:', response);
      }
    } catch (err: any) {
      console.error('Error loading ambulance requests:', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load ambulance requests. Please try again.';
      setError(message);
    } finally {
      setLoadingAmbulanceRequests(false);
    }
  };
  
  // Load blood requests
  const loadBloodRequests = async () => {
    setLoadingBloodRequests(true);
    try {
      const response = await bloodDonationService.getAllBloodRequests();
      setBloodRequests(response);
    } catch (err) {
      console.error('Error loading blood requests:', err);
      setError('Failed to load blood requests. Please try again.');
    } finally {
      setLoadingBloodRequests(false);
    }
  };
  
  // Load ambulances
  const loadAmbulances = async () => {
    setLoadingAmbulances(true);
    try {
      const response = await ambulanceService.getAllAmbulances();
      setAmbulances(response);
    } catch (err) {
      console.error('Error loading ambulances:', err);
      setError('Failed to load ambulances. Please try again.');
    } finally {
      setLoadingAmbulances(false);
    }
  };
  
  // Update ambulance request status
  const handleUpdateAmbulanceRequestStatus = async (requestId: string, status: string) => {
    try {
      await ambulanceService.updateAmbulanceRequestStatus(requestId, status);
      setSuccessMessage('Ambulance request status updated successfully');
      loadAmbulanceRequests();
    } catch (err) {
      console.error('Error updating ambulance request status:', err);
      setError('Failed to update ambulance request status. Please try again.');
    }
  };
  // Open allocation dialog
  const handleOpenAllocate = async (requestId: string) => {
    setAllocateForRequestId(requestId);
    // Ensure ambulances list is fresh
    try {
      const response = await ambulanceService.getAllAmbulances();
      setAmbulances(response);
    } catch (err) {
      // ignore, error handling elsewhere
    }
    setAllocateAmbulanceId('');
    setOpenAllocateDialog(true);
  };
  const handleConfirmAllocate = async () => {
    if (!allocateForRequestId || !allocateAmbulanceId) return;
    try {
      await ambulanceService.allocateAmbulanceToRequest(allocateForRequestId, allocateAmbulanceId);
      setSuccessMessage('Ambulance allocated successfully');
      setOpenAllocateDialog(false);
      setAllocateAmbulanceId('');
      setAllocateForRequestId(null);
      loadAmbulanceRequests();
    } catch (err) {
      console.error('Error allocating ambulance:', err);
      setError('Failed to allocate ambulance. Please try again.');
    }
  };
  const handleCloseAllocate = () => {
    setOpenAllocateDialog(false);
    setAllocateAmbulanceId('');
    setAllocateForRequestId(null);
  };
  
  // Update blood request status
  const handleUpdateBloodRequestStatus = async (requestId: string, status: string) => {
    try {
      await bloodDonationService.updateBloodRequestStatus(requestId, status);
      setSuccessMessage('Blood request status updated successfully');
      loadBloodRequests();
    } catch (err) {
      console.error('Error updating blood request status:', err);
      setError('Failed to update blood request status. Please try again.');
    }
  };
  
  // Ambulance management
  const handleOpenAmbulanceDialog = (ambulance?: Ambulance) => {
    if (ambulance) {
      setSelectedAmbulance(ambulance);
      setAmbulanceFormData({
        registrationNumber: ambulance.registrationNumber,
        capacity: ambulance.capacity || 4,
        driver: {
          name: ambulance.driver.name,
          phone: ambulance.driver.phone
        },
        location: ambulance.location || { latitude: 0, longitude: 0, updatedAt: new Date() },
        status: ambulance.status
      });
    } else {
      setSelectedAmbulance(null);
      setAmbulanceFormData({
        registrationNumber: '',
        capacity: 4,
        driver: {
          name: '',
          phone: ''
        },
        location: {
          latitude: 0,
          longitude: 0,
          updatedAt: new Date()
        },
        status: 'available'
      });
    }
    setOpenAmbulanceDialog(true);
  };
  
  const handleCloseAmbulanceDialog = () => {
    setOpenAmbulanceDialog(false);
  };
  
  const handleAmbulanceFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name === 'driverName') {
      setAmbulanceFormData({
        ...ambulanceFormData,
        driver: {
          ...ambulanceFormData.driver,
          name: value as string
        }
      });
    } else if (name === 'driverPhone') {
      setAmbulanceFormData({
        ...ambulanceFormData,
        driver: {
          ...ambulanceFormData.driver,
          phone: value as string
        }
      });
    } else {
      setAmbulanceFormData({
        ...ambulanceFormData,
        [name as string]: value
      });
    }
  };
  
  const handleSaveAmbulance = async () => {
    try {
      if (selectedAmbulance) {
        // Update existing ambulance
        await ambulanceService.updateAmbulanceStatus(selectedAmbulance._id, ambulanceFormData.status);
        setSuccessMessage('Ambulance updated successfully');
      } else {
        // Create new ambulance
        await ambulanceService.createAmbulance(ambulanceFormData);
        setSuccessMessage('Ambulance created successfully');
      }
      handleCloseAmbulanceDialog();
      loadAmbulances();
    } catch (err) {
      console.error('Error saving ambulance:', err);
      setError('Failed to save ambulance. Please try again.');
    }
  };
  
  const handleDeleteAmbulance = async (ambulanceId: string) => {
    if (window.confirm('Are you sure you want to delete this ambulance?')) {
      try {
        await ambulanceService.deleteAmbulance(ambulanceId);
        setSuccessMessage('Ambulance deleted successfully');
        loadAmbulances();
      } catch (err) {
        console.error('Error deleting ambulance:', err);
        setError('Failed to delete ambulance. Please try again.');
      }
    }
  };
  
  // Load campaigns
  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await campaignService.getAllCampaigns();
      setCampaigns(response);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoadingCampaigns(false);
    }
  };
  
  // Load blood inventory
  const loadBloodInventory = async () => {
    setLoadingBloodInventory(true);
    try {
      const data = await bloodInventoryService.getBloodInventory();
      setBloodInventory(data);
    } catch (err) {
      console.error('Error loading blood inventory:', err);
      setError('Failed to load blood inventory. Please try again.');
    } finally {
      setLoadingBloodInventory(false);
    }
  };
  
  // Blood Inventory management
  const handleOpenBloodInventoryDialog = (group?: string) => {
    if (group) {
      const item = bloodInventory.find((item: any) => item.bloodGroup === group);
      setSelectedBloodGroup(group);
      setBloodInventoryFormData({
        bloodGroup: group,
        units: item?.units || 0
      });
    } else {
      setSelectedBloodGroup(null);
      setBloodInventoryFormData({
        bloodGroup: 'A+',
        units: 0
      });
    }
    setOpenBloodInventoryDialog(true);
  };
  
  const handleCloseBloodInventoryDialog = () => {
    setOpenBloodInventoryDialog(false);
  };
  
  const handleSaveBloodInventory = async () => {
  try {
    console.log('Saving blood inventory:', bloodInventoryFormData);
    const result = await bloodInventoryService.updateBloodInventory(
      bloodInventoryFormData.bloodGroup,
      Number(bloodInventoryFormData.units)
    );
    console.log('Blood inventory save result:', result);
    setSuccessMessage(result.message || result.data?.message || 'Blood inventory updated successfully');
    handleCloseBloodInventoryDialog();
    loadBloodInventory();
  } catch (err: any) {
    console.error('Error saving blood inventory:', err);
    console.error('Error response:', err.response?.data);
    const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save blood inventory. Please try again.';
    setError(errorMessage);
  }
};
  
  // Campaign management
  const handleOpenCampaignDialog = (campaign?: Campaign) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setCampaignFormData({
        title: campaign.title,
        description: campaign.description,
        address: campaign.location.address,
        startDate: new Date(campaign.startDate).toISOString().split('T')[0],
        endDate: new Date(campaign.endDate).toISOString().split('T')[0],
        bloodGroupsNeeded: campaign.bloodGroupsNeeded.join(', '),
        image: campaign.image || ''
      });
    } else {
      setSelectedCampaign(null);
      setCampaignFormData({
        title: '',
        description: '',
        address: '',
        startDate: '',
        endDate: '',
        bloodGroupsNeeded: '',
        image: ''
      });
    }
    setOpenCampaignDialog(true);
  };
  
  const handleCloseCampaignDialog = () => {
    setOpenCampaignDialog(false);
  };
  
  const handleCampaignFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setCampaignFormData({
      ...campaignFormData,
      [name as string]: value
    });
  };
  
  const handleSaveCampaign = async () => {
    console.log('Starting campaign save...');
    console.log('Campaign form data:', campaignFormData);
    console.log('Selected campaign:', selectedCampaign);
    console.log('User:', user);
    
    // Check if user is authenticated and is admin
    if (!user) {
      setError('You must be logged in to create campaigns');
      return;
    }
    
    if (user.role !== 'admin') {
      setError('You must be an admin to create campaigns');
      return;
    }
    
    // Validate required fields
    if (!campaignFormData.title || !campaignFormData.description || !campaignFormData.address || !campaignFormData.startDate || !campaignFormData.endDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      if (selectedCampaign) {
        console.log('Updating existing campaign...');
        // Update existing campaign
        const updateData = {
          title: campaignFormData.title,
          description: campaignFormData.description,
          location: {
            address: campaignFormData.address
          },
          startDate: new Date(campaignFormData.startDate),
          endDate: new Date(campaignFormData.endDate),
          bloodGroupsNeeded:  campaignFormData.bloodGroupsNeeded.split(',').map(bg => bg.trim()).filter(bg => bg),
          image: campaignFormData.image
        };
        console.log('Update data:', updateData);
        
        await campaignService.updateCampaign(
          selectedCampaign._id,
          updateData
        );
        setSuccessMessage('Campaign updated successfully');
      } else {
        console.log('Creating new campaign...');
        // Create new campaign
        const createData = {
          title: campaignFormData.title,
          description: campaignFormData.description,
          location: {
            address: campaignFormData.address
          },
          startDate: new Date(campaignFormData.startDate),
          endDate: new Date(campaignFormData.endDate),
          bloodGroupsNeeded: campaignFormData.bloodGroupsNeeded.split(',').map(bg => bg.trim()).filter(bg => bg),
          image: campaignFormData.image
        };
        console.log('Create data:', createData);
        
        const result = await campaignService.createCampaign(createData);
        console.log('Create result:', result);
        setSuccessMessage('Campaign created successfully');
      }
      handleCloseCampaignDialog();
      loadCampaigns();
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create campaigns. Admin access required.');
      } else {
        setError(`Failed to save campaign: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      }
    }
  };
  
  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignService.deleteCampaign(campaignId);
        setSuccessMessage('Campaign deleted successfully');
        loadCampaigns();
      } catch (err) {
        console.error('Error deleting campaign:', err);
        setError('Failed to delete campaign. Please try again.');
      }
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'accepted':
      case 'processing':
        return 'info';
      case 'completed':
      case 'fulfilled':
        return 'success';
      case 'cancelled':
      case 'rejected':
        return 'error';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      {user && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Logged in as: {user.name} ({user.role})
        </Typography>
      )}
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Manage ambulance requests, blood requests, and ambulance fleet
      </Typography>
      
      {/* Quick Actions */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              startIcon={<AddIcon />}
              onClick={() => handleOpenAmbulanceDialog()}
              sx={{ py: 1.5 }}
            >
              Add Ambulance Details
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth 
              startIcon={<BloodIcon />}
              onClick={() => setTabValue(1)}
              sx={{ py: 1.5 }}
            >
              View Blood Requests
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth 
              startIcon={<CampaignIcon />}
              onClick={() => handleOpenCampaignDialog()}
              sx={{ py: 1.5 }}
            >
              Add Campaign
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth 
              startIcon={<BloodIcon />}
              onClick={() => setTabValue(4)}
              sx={{ py: 1.5 }}
            >
              Edit Blood Availability
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab icon={<RequestIcon />} label="Ambulance Requests" {...a11yProps(0)} />
          <Tab icon={<BloodIcon />} label="Blood Requests" {...a11yProps(1)} />
          <Tab icon={<AmbulanceIcon />} label="Ambulances" {...a11yProps(2)} />
          <Tab icon={<CampaignIcon />} label="Campaigns" {...a11yProps(3)} />
          <Tab icon={<BloodIcon />} label="Blood Inventory" {...a11yProps(4)} />
        </Tabs>
      </Box>
      
      {/* Ambulance Requests Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Ambulance Requests</Typography>
          <IconButton color="primary" onClick={loadAmbulanceRequests}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {loadingAmbulanceRequests ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : ambulanceRequests.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No ambulance requests found
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Pickup Location</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Need Blood</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ambulanceRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.patientName}</TableCell>
                    <TableCell>{request.user?.name || 'N/A'}</TableCell>
                    <TableCell>{request.patientPhone || request.user?.phone || 'N/A'}</TableCell>
                    <TableCell>{request.pickupLocation.address}</TableCell>
                    <TableCell>{request.destination?.address || 'N/A'}</TableCell>
                    <TableCell>{request.needsBlood ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.urgency || 'medium'}
                        color={(request.urgency || 'medium') === 'critical' ? 'error' : (request.urgency || 'medium') === 'medium' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell align="right">
                      {request.status === 'pending' && (
                        <>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="success" 
                            onClick={() => handleUpdateAmbulanceRequestStatus(request._id, 'accepted')}
                            sx={{ mr: 1 }}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error" 
                            onClick={() => handleUpdateAmbulanceRequestStatus(request._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenAllocate(request._id)}
                            sx={{ ml: 1 }}
                          >
                            Allocate
                          </Button>
                        </>
                      )}
                      {request.status === 'accepted' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary" 
                          onClick={() => handleUpdateAmbulanceRequestStatus(request._id, 'in-progress')}
                        >
                          Start
                        </Button>
                      )}
                      {(request.status === 'accepted' || request.status === 'in-progress') && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleOpenAllocate(request._id)}
                          sx={{ ml: 1 }}
                        >
                          Reassign
                        </Button>
                      )}
                      {request.status === 'in-progress' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success" 
                          onClick={() => handleUpdateAmbulanceRequestStatus(request._id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      {/* Blood Requests Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Blood Requests</Typography>
          <IconButton color="primary" onClick={loadBloodRequests}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {loadingBloodRequests ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : bloodRequests.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No blood requests found
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Quantity (Units)</TableCell>
                  <TableCell>Hospital</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bloodRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.patientName}</TableCell>
                    <TableCell>{request.requester?.name || 'N/A'}</TableCell>
                    <TableCell>{request.requester?.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BloodIcon color="error" sx={{ mr: 1 }} />
                        {request.bloodGroup}
                      </Box>
                    </TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>{request.hospital}</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.urgency} 
                        color={
                          request.urgency === 'critical' ? 'error' : 
                          request.urgency === 'urgent' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell align="right">
                      {request.status === 'pending' && (
                        <>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="success" 
                            onClick={() => handleUpdateBloodRequestStatus(request._id, 'processing')}
                            sx={{ mr: 1 }}
                          >
                            Process
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error" 
                            onClick={() => handleUpdateBloodRequestStatus(request._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {request.status === 'processing' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success" 
                          onClick={() => handleUpdateBloodRequestStatus(request._id, 'fulfilled')}
                        >
                          Fulfill
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      {/* Ambulances Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Manage Ambulances</Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenAmbulanceDialog()}
            >
              Add Ambulance
            </Button>
            <IconButton color="primary" onClick={loadAmbulances} sx={{ ml: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        {loadingAmbulances ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : ambulances.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No ambulances found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {ambulances.map((ambulance) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ambulance._id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {ambulance.registrationNumber}
                      </Typography>
                      <Chip 
                        label={ambulance.status} 
                        color={
                          ambulance.status === 'available' ? 'success' : 
                          ambulance.status === 'busy' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Driver:</strong> {ambulance.driver.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Contact:</strong> {ambulance.driver.phone}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Capacity:</strong> {ambulance.capacity || 4} patients
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton color="primary" onClick={() => handleOpenAmbulanceDialog(ambulance)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteAmbulance(ambulance._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Campaigns Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Manage Campaigns</Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenCampaignDialog()}
            >
              Add Campaign
            </Button>
            <IconButton color="primary" onClick={loadCampaigns} sx={{ ml: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        {loadingCampaigns ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : campaigns.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No campaigns found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {campaigns.map((campaign) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign._id}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {campaign.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Start:</strong> {formatDate(campaign.startDate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>End:</strong> {formatDate(campaign.endDate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Location:</strong> {campaign.location.address}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Participants:</strong> {campaign.participants.length}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ mb: 2 }}>
                      {campaign.description.substring(0, 80)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton color="primary" onClick={() => handleOpenCampaignDialog(campaign)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteCampaign(campaign._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Blood Inventory Tab */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Blood Inventory Management</Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenBloodInventoryDialog()}
            >
              Add Blood Group
            </Button>
            <IconButton color="primary" onClick={loadBloodInventory} sx={{ ml: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        {loadingBloodInventory ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => {
              const item = bloodInventory.find((item: any) => item.bloodGroup === group) || { 
                bloodGroup: group, 
                units: 0,
                lastUpdated: new Date().toISOString(),
                updatedBy: { name: 'System' }
              };
              
              const isLowStock = item.units < 5;
              const isCritical = item.units === 0;
              
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={group}>
                  <Card 
                    elevation={3}
                    sx={{
                      border: `2px solid ${
                        isCritical ? '#f44336' : isLowStock ? '#ff9800' : 'transparent'
                      }`,
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          {group}
                        </Typography>
                        <BloodIcon color={isCritical ? 'error' : isLowStock ? 'warning' : 'success'} />
                      </Box>
                      <Typography variant="h4" component="div" sx={{ mb: 1, color: isCritical ? 'error.main' : 'text.primary' }}>
                        {item.units}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Units Available
                      </Typography>
                      {item.updatedBy && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          Updated by: {item.updatedBy.name}
                        </Typography>
                      )}
                      <Typography variant="caption" color="textSecondary" display="block">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenBloodInventoryDialog(group)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </TabPanel>
      
      {/* Ambulance Dialog */}
      <Dialog open={openAmbulanceDialog} onClose={handleCloseAmbulanceDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedAmbulance ? 'Edit Ambulance' : 'Add Ambulance'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="registrationNumber"
                  label="Registration Number"
                  fullWidth
                  value={ambulanceFormData.registrationNumber}
                  onChange={handleAmbulanceFormChange}
                  required
                  disabled={!!selectedAmbulance}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="capacity"
                  label="Capacity"
                  type="number"
                  fullWidth
                  value={ambulanceFormData.capacity}
                  onChange={handleAmbulanceFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={ambulanceFormData.status}
                    label="Status"
                    onChange={(e) => handleAmbulanceFormChange(e as any)}
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="busy">Busy</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Driver Information
                  </Typography>
                </Divider>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="driverName"
                  label="Driver Name"
                  fullWidth
                  value={ambulanceFormData.driver.name}
                  onChange={handleAmbulanceFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="driverPhone"
                  label="Driver Phone"
                  fullWidth
                  value={ambulanceFormData.driver.phone}
                  onChange={handleAmbulanceFormChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAmbulanceDialog}>Cancel</Button>
          <Button onClick={handleSaveAmbulance} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Campaign Dialog */}
      <Dialog open={openCampaignDialog} onClose={handleCloseCampaignDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Add Campaign'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="title"
                  label="Campaign Title"
                  fullWidth
                  value={campaignFormData.title}
                  onChange={handleCampaignFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={campaignFormData.description}
                  onChange={handleCampaignFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="address"
                  label="Location Address"
                  fullWidth
                  value={campaignFormData.address}
                  onChange={handleCampaignFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={campaignFormData.startDate}
                  onChange={handleCampaignFormChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="endDate"
                  label="End Date"
                  type="date"
                  fullWidth
                  value={campaignFormData.endDate}
                  onChange={handleCampaignFormChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="image"
                  label="Image URL (optional)"
                  fullWidth
                  value={campaignFormData.image}
                  onChange={handleCampaignFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Blood Groups Needed (comma-separated, e.g., A+, B+, O-)
                </Typography>
                <TextField
                  name="bloodGroupsNeeded"
                  label="Blood Groups"
                  fullWidth
                  value={campaignFormData.bloodGroupsNeeded}
                  onChange={handleCampaignFormChange}
                  placeholder="A+, B+, O-, AB+"
                  inputProps={{
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    autoCapitalize: 'off',
                    spellCheck: 'false'
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCampaignDialog}>Cancel</Button>
          <Button onClick={handleSaveCampaign} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Blood Inventory Dialog */}
      <Dialog open={openBloodInventoryDialog} onClose={handleCloseBloodInventoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBloodGroup ? `Edit ${selectedBloodGroup} Inventory` : 'Add Blood Group Inventory'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    value={bloodInventoryFormData.bloodGroup}
                    label="Blood Group"
                    onChange={(e) => setBloodInventoryFormData({
                      ...bloodInventoryFormData,
                      bloodGroup: e.target.value as string
                    })}
                    disabled={!!selectedBloodGroup}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                      <MenuItem key={group} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="units"
                  label="Units Available"
                  type="number"
                  fullWidth
                  value={bloodInventoryFormData.units}
                  onChange={(e) => setBloodInventoryFormData({
                    ...bloodInventoryFormData,
                    units: parseInt(e.target.value) || 0
                  })}
                  required
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBloodInventoryDialog}>Cancel</Button>
          <Button onClick={handleSaveBloodInventory} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      {/* Allocate Ambulance Dialog */}
      <Dialog open={openAllocateDialog} onClose={handleCloseAllocate} maxWidth="sm" fullWidth>
        <DialogTitle>Allocate Ambulance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="allocate-ambulance-label">Select Ambulance</InputLabel>
              <Select
                labelId="allocate-ambulance-label"
                value={allocateAmbulanceId}
                label="Select Ambulance"
                onChange={(e) => setAllocateAmbulanceId(e.target.value as string)}
              >
                {ambulances
                  .filter(a => a.status === 'available')
                  .map(a => (
                    <MenuItem key={a._id} value={a._id}>
                      {a.registrationNumber} — Driver: {a.driver?.name} ({a.driver?.phone})
                    </MenuItem>
                  ))
                }
                {ambulances.filter(a => a.status === 'available').length === 0 && (
                  <MenuItem value="" disabled>No available ambulances</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAllocate}>Cancel</Button>
          <Button onClick={handleConfirmAllocate} disabled={!allocateAmbulanceId} variant="contained">
            Allocate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboardNew;
