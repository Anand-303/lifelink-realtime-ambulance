import React, { useState, useEffect, useCallback, FC, ReactNode, ChangeEvent } from 'react';
import Grid from '../../components/CustomGrid';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  Campaign as CampaignIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateUserProfile } from '../../redux/slices/authSlice';
import { bloodDonationService, campaignService, ambulanceService } from '../../services/api';
import { AmbulanceRequest, BloodRequest, Campaign } from '../../types';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  [key: string]: any; // For additional props
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

const ProfilePage: FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);
  const [tabValue, setTabValue] = useState(0);
  
  // Profile state
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: ''
  });
  
  // Activity state
  const [ambulanceRequests, setAmbulanceRequests] = useState<AmbulanceRequest[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [registeredCampaigns, setRegisteredCampaigns] = useState<Campaign[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // Error and success handling
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || ''
      });
    }
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Load user activity
  const loadUserActivity = useCallback(async () => {
    setLoadingRequests(true);
    try {
      // Load ambulance requests
      const ambulanceResponse = await ambulanceService.getUserAmbulanceRequests();
      setAmbulanceRequests(ambulanceResponse.data);
      
      // Load blood requests
      const bloodResponse = await bloodDonationService.getUserBloodRequests();
      setBloodRequests(bloodResponse.data);

      // Load registered campaigns
      const campaignsResponse = await campaignService.getAllCampaigns();
      const userCampaigns = campaignsResponse.data.filter((campaign: Campaign) => 
        campaign.participants?.some(participant => typeof participant === 'object' && participant._id === user?._id)
      );
      setRegisteredCampaigns(userCampaigns);
    } catch (err) {
      console.error('Error loading user activity:', err);
      setError('Failed to load your activity. Please try again.');
    } finally {
      setLoadingRequests(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && tabValue === 1) {
      loadUserActivity();
    }
  }, [user, tabValue, loadUserActivity]);
  
  // Handle input field changes
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select field changes
  const handleSelectChange = (e: { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode && user) {
      // Reset form if canceling edit
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || ''
      });
    }
  };
  
  // Save profile changes
  const saveProfile = async () => {
    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
      setSuccessMessage('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'success';
      case 'rejected':
      case 'cancelled':
        return 'error';
      case 'pending':
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab icon={<PersonIcon />} label="Profile" {...a11yProps(0)} />
          <Tab icon={<HospitalIcon />} label="Activity" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} component="div">
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                alt={user.name}
                src="/static/images/avatar/1.jpg"
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {user.email}
              </Typography>
              <Chip 
                label={user.role} 
                color={user.role === 'admin' ? 'secondary' : 'primary'}
                sx={{ mt: 1 }}
              />
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color={editMode ? 'error' : 'primary'}
                  startIcon={<EditIcon />}
                  onClick={toggleEditMode}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={8} component="div">
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} component="div">
                  <TextField
                    name="name"
                    label="Full Name"
                    fullWidth
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} component="div">
                  <TextField
                    name="email"
                    label="Email Address"
                    fullWidth
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} component="div">
                  <TextField
                    name="phone"
                    label="Phone Number"
                    fullWidth
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    placeholder="e.g., +1 (123) 456-7890"
                  />
                </Grid>
                <Grid item xs={12} sm={6} component="div">
                  {editMode ? (
                    <FormControl fullWidth>
                      <InputLabel>Blood Group</InputLabel>
                      <Select
                        name="bloodGroup"
                        value={profileData.bloodGroup}
                        label="Blood Group"
                        onChange={handleSelectChange}
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
                  ) : (
                    <TextField
                      label="Blood Group"
                      fullWidth
                      value={profileData.bloodGroup || 'Not specified'}
                      disabled
                    />
                  )}
                </Grid>
              </Grid>
              
              {editMode && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={saveProfile}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Activity Tab */}
      <TabPanel value={tabValue} index={1}>
        {loadingRequests ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Ambulance Requests */}
            <Grid item xs={12} md={6} component="div">
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HospitalIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Ambulance Requests</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {ambulanceRequests.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" align="center">
                    You haven't made any ambulance requests yet
                  </Typography>
                ) : (
                  <List>
                    {ambulanceRequests.map((request: AmbulanceRequest) => (
                      <Card key={request._id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {request.pickupLocation.address}
                            </Typography>
                            <Chip 
                              label={request.status} 
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            To: {request.destinationLocation?.address || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Requested on: {formatDate(request.createdAt)}
                          </Typography>
                          {request.ambulance && (
                            <Typography variant="body2" color="textSecondary">
                              Ambulance: {typeof request.ambulance === 'object' ? request.ambulance.registrationNumber : request.ambulance}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
            
            {/* Blood Requests */}
            <Grid item xs={12} md={6} component="div">
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BloodIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Blood Requests</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {bloodRequests.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" align="center">
                    You haven't made any blood requests yet
                  </Typography>
                ) : (
                  <List>
                    {bloodRequests.map((request: BloodRequest) => (
                      <Card key={request._id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {request.patientName} - {request.bloodGroup} ({request.quantity} units)
                            </Typography>
                            <Chip 
                              label={request.status} 
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Hospital: {request.hospital}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Requested on: {formatDate(request.createdAt)}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
            
            {/* Registered Campaigns */}
            <Grid item xs={12} component="div">
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CampaignIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Registered Campaigns</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {registeredCampaigns.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" align="center">
                    You haven't registered for any campaigns yet
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {registeredCampaigns.map((campaign: Campaign, index: number) => (
                      <Grid item xs={12} sm={6} md={4} key={index} component="div">
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {campaign.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Date: {formatDate(campaign.date)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Location: {campaign.location}
                            </Typography>
                            <Chip 
                              label={campaign.date && new Date(campaign.date) > new Date() ? 'Upcoming' : 'Past'} 
                              color={campaign.date && new Date(campaign.date) > new Date() ? 'primary' : 'default'}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </TabPanel>
      
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

export default ProfilePage;