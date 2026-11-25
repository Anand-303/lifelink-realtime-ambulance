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
  List,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Bloodtype as BloodIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { authService, ambulanceService, bloodDonationService, campaignService } from '../../services/api';
import { User, Ambulance, BloodRequest, Campaign } from '../../types';

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

interface BloodInventory {
  bloodType: string;
  quantity: number;
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    role: 'user'
  });
  
  // Ambulances state
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loadingAmbulances, setLoadingAmbulances] = useState(true);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [openAmbulanceDialog, setOpenAmbulanceDialog] = useState(false);
  const [ambulanceFormData, setAmbulanceFormData] = useState({
    registrationNumber: '',
    capacity: 4,
    driver: {
      name: '',
      phone: ''
    },
    status: 'available'
  });
  
  // Blood inventory state
  const [bloodInventory, setBloodInventory] = useState<BloodInventory[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loadingBloodRequests, setLoadingBloodRequests] = useState(true);
  
  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
  const [campaignFormData, setCampaignFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: ''
  });
  
  // Error and success handling
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Load data based on active tab
  useEffect(() => {
    if (tabValue === 0) {
      loadUsers();
    } else if (tabValue === 1) {
      loadAmbulances();
    } else if (tabValue === 2) {
      loadBloodInventory();
      loadBloodRequests();
    } else if (tabValue === 3) {
      loadCampaigns();
    }
  }, [tabValue]);
  
  // Load users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await authService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Load ambulances
  const loadAmbulances = async () => {
    setLoadingAmbulances(true);
    try {
      const response = await ambulanceService.getAllAmbulances();
      setAmbulances(response.data);
    } catch (err) {
      console.error('Error loading ambulances:', err);
      setError('Failed to load ambulances. Please try again.');
    } finally {
      setLoadingAmbulances(false);
    }
  };
  
  // Load blood inventory
  const loadBloodInventory = async () => {
    setLoadingInventory(true);
    try {
      const response = await bloodDonationService.getBloodInventory();
      setBloodInventory(response.data);
    } catch (err) {
      console.error('Error loading blood inventory:', err);
      setError('Failed to load blood inventory. Please try again.');
    } finally {
      setLoadingInventory(false);
    }
  };
  
  // Load blood requests
  const loadBloodRequests = async () => {
    setLoadingBloodRequests(true);
    try {
      const response = await bloodDonationService.getUserBloodRequests();
      setBloodRequests(response.data);
    } catch (err) {
      console.error('Error loading blood requests:', err);
      setError('Failed to load blood requests. Please try again.');
    } finally {
      setLoadingBloodRequests(false);
    }
  };
  
  // Load campaigns
  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await campaignService.getAllCampaigns();
      setCampaigns(response.data);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoadingCampaigns(false);
    }
  };
  
  // User management
  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setUserFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || '',
        role: user.role
      });
    } else {
      setSelectedUser(null);
      setUserFormData({
        name: '',
        email: '',
        phone: '',
        bloodGroup: '',
        role: 'user'
      });
    }
    setOpenUserDialog(true);
  };
  
  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };
  
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setUserFormData({
      ...userFormData,
      [name as string]: value
    });
  };
  
  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        await authService.updateUser(selectedUser._id, userFormData);
        setSuccessMessage('User updated successfully');
      } else {
        // Create new user
        await authService.createUser({
          ...userFormData,
          password: 'defaultPassword123' // Default password for new users
        });
        setSuccessMessage('User created successfully');
      }
      handleCloseUserDialog();
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authService.deleteUser(userId);
        setSuccessMessage('User deleted successfully');
        loadUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };
  
  // Ambulance management
  const handleOpenAmbulanceDialog = (ambulance?: Ambulance) => {
    if (ambulance) {
      setSelectedAmbulance(ambulance);
      setAmbulanceFormData({
        registrationNumber: ambulance.registrationNumber,
        capacity: 0,
        driver: {
          name: ambulance.driver.name,
          phone: ambulance.driver.phone
        },
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
  
  // Blood request management
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
  
  // Campaign management
  const handleOpenCampaignDialog = (campaign?: Campaign) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setCampaignFormData({
        title: campaign.title,
        description: campaign.description,
        date: new Date(campaign.date || campaign.startDate).toISOString().split('T')[0],
        location: campaign.location,
        image: campaign.image || ''
      });
    } else {
      setSelectedCampaign(null);
      setCampaignFormData({
        title: '',
        description: '',
        date: '',
        location: '',
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
    try {
      if (selectedCampaign) {
        // Update existing campaign
        await campaignService.updateCampaign(selectedCampaign._id, campaignFormData);
        setSuccessMessage('Campaign updated successfully');
      } else {
        // Create new campaign
        await campaignService.createCampaign(campaignFormData);
        setSuccessMessage('Campaign created successfully');
      }
      handleCloseCampaignDialog();
      loadCampaigns();
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError('Failed to save campaign. Please try again.');
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
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab icon={<PersonIcon />} label="Users" {...a11yProps(0)} />
          <Tab icon={<HospitalIcon />} label="Ambulances" {...a11yProps(1)} />
          <Tab icon={<BloodIcon />} label="Blood Management" {...a11yProps(2)} />
          <Tab icon={<CampaignIcon />} label="Campaigns" {...a11yProps(3)} />
        </Tabs>
      </Box>
      
      {/* Users Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Manage Users</Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenUserDialog()}
            >
              Add User
            </Button>
            <IconButton color="primary" onClick={loadUsers} sx={{ ml: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No users found
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Blood Group</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.bloodGroup || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'admin' ? 'secondary' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenUserDialog(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUser(user._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      {/* Ambulances Tab */}
      <TabPanel value={tabValue} index={1}>
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Registration Number</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ambulances.map((ambulance) => (
                  <TableRow key={ambulance._id}>
                    <TableCell>{ambulance.registrationNumber}</TableCell>
                    <TableCell>{ambulance.driver.name}</TableCell>
                    <TableCell>{ambulance.driver.phone}</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      <Chip 
                        label={ambulance.status} 
                        color={
                          ambulance.status === 'available' ? 'success' : 
                          ambulance.status === 'busy' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenAmbulanceDialog(ambulance)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteAmbulance(ambulance._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      {/* Blood Management Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* Blood Inventory */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Blood Inventory</Typography>
                <IconButton color="primary" onClick={loadBloodInventory}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              
              {loadingInventory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : bloodInventory.length === 0 ? (
                <Typography variant="body1" color="textSecondary" align="center">
                  No blood inventory data available
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Blood Type</TableCell>
                        <TableCell align="right">Quantity (Units)</TableCell>
                        <TableCell align="right">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bloodInventory.map((item) => (
                        <TableRow key={item.bloodType}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <BloodIcon color="error" sx={{ mr: 1 }} />
                              {item.bloodType}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={item.quantity > 10 ? 'Sufficient' : item.quantity > 0 ? 'Low' : 'Critical'} 
                              color={item.quantity > 10 ? 'success' : item.quantity > 0 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
          
          {/* Blood Requests */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
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
                <Typography variant="body1" color="textSecondary" align="center">
                  No blood requests available
                </Typography>
              ) : (
                <List>
                  {bloodRequests.map((request) => (
                    <Paper key={request._id} elevation={2} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">
                            {request.patientName} - {request.bloodGroup} ({request.quantity} units)
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Requested by: {typeof request.requester === 'string' ? 'Unknown' : request.requester.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Hospital: {request.hospital}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Date: {formatDate(request.createdAt)}
                          </Typography>
                        </Box>
                        <Chip 
                          label={request.status} 
                          color={
                            request.status === 'fulfilled' ? 'success' :
                            request.status === 'rejected' ? 'error' :
                            request.status === 'approved' ? 'primary' : 'warning'
                          }
                          size="small"
                        />
                      </Box>
                      
                      {request.status === 'pending' && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="success" 
                            onClick={() => handleUpdateBloodRequestStatus(request._id, 'approved')}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error" 
                            onClick={() => handleUpdateBloodRequestStatus(request._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
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
                      Date: {formatDate(campaign.date || campaign.startDate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Location: {campaign.location}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Participants: {campaign.participants?.length || 0}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ mb: 2 }}>
                      {campaign.description.substring(0, 100)}...
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
      
      {/* User Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="name"
                  label="Name"
                  fullWidth
                  value={userFormData.name}
                  onChange={handleUserFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={userFormData.email}
                  onChange={handleUserFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="phone"
                  label="Phone"
                  fullWidth
                  value={userFormData.phone}
                  onChange={handleUserFormChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    name="bloodGroup"
                    value={userFormData.bloodGroup}
                    label="Blood Group"
                    onChange={(e) => handleUserFormChange(e as any)}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={userFormData.role}
                    label="Role"
                    onChange={(e) => handleUserFormChange(e as any)}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
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
      <Dialog open={openCampaignDialog} onClose={handleCloseCampaignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Add Campaign'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="title"
                  label="Title"
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  fullWidth
                  value={campaignFormData.date}
                  onChange={handleCampaignFormChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  value={campaignFormData.location}
                  onChange={handleCampaignFormChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="image"
                  label="Image URL (Optional)"
                  fullWidth
                  value={campaignFormData.image}
                  onChange={handleCampaignFormChange}
                  placeholder="https://example.com/image.jpg"
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
    </Container>
  );
};

export default AdminDashboard;