import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  Tabs,
  Tab
} from '@mui/material';
import { Search as SearchIcon, CalendarToday, LocationOn, People } from '@mui/icons-material';
import { useAppSelector } from '../../redux/hooks';
import { campaignService } from '../../services/api';
import { Campaign } from '../../types';

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
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
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
    id: `campaign-tab-${index}`,
    'aria-controls': `campaign-tabpanel-${index}`,
  };
}

const CampaignsPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [tabValue, setTabValue] = useState(0);
  
  // State for campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  // State for campaign details
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for registration
  const [registering, setRegistering] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Load campaigns
  useEffect(() => {
    let isMounted = true;
    
    const loadCampaigns = async () => {
      if (!isMounted) return;
      
      setLoadingCampaigns(true);
      try {
        const response = await campaignService.getAllCampaigns();
        if (isMounted) {
          const campaignsData = response?.data || [];
          setCampaigns(campaignsData);
          setFilteredCampaigns(campaignsData);
          
          // Filter user's campaigns if logged in
          if (user) {
            const userCamps = campaignsData.filter(
              (campaign: Campaign) => 
                campaign.participants?.some(
                  (p: any) => p._id === user._id || (typeof p === 'string' && p === user._id)
                )
            );
            setUserCampaigns(userCamps);
          }
        }
      } catch (err) {
        console.error('Error loading campaigns:', err);
        if (isMounted) {
          setError('Failed to load campaigns. Please try again.');
          setCampaigns([]);
          setFilteredCampaigns([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCampaigns(false);
        }
      }
    };
    
    loadCampaigns();
    
    return () => {
      isMounted = false;
    };
  }, [user]);
  
  // Handle search
  useEffect(() => {
    if (!campaigns || !Array.isArray(campaigns)) return;
    
    if (searchQuery.trim() === '') {
      setFilteredCampaigns(campaigns);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = campaigns.filter(campaign =>
        campaign?.title?.toLowerCase().includes(query) ||
        campaign?.description?.toLowerCase().includes(query) ||
        campaign?.location?.toLowerCase().includes(query)
      );
      setFilteredCampaigns(filtered);
    }
  }, [searchQuery, campaigns]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };
  
  // Open campaign details
  const handleOpenDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setOpenDetailsDialog(true);
  };
  
  // Close campaign details
  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
  };
  
  // Register for campaign
  const handleRegister = async (campaignId: string) => {
    if (!user) {
      setError('You must be logged in to register for a campaign');
      return;
    }
    
    setRegistering(true);
    try {
      await campaignService.registerForCampaign(campaignId);
      
      // Update campaigns list
      const response = await campaignService.getAllCampaigns();
      setCampaigns(response.data);
      setFilteredCampaigns(response.data);
      
      // Update user's registered campaigns
      const userRegisteredCampaigns = response.data.filter((campaign: Campaign) => 
        campaign.participants?.some(participant => 
          typeof participant === 'string' ? participant === user._id : participant._id === user._id
        ) || false
      );
      setUserCampaigns(userRegisteredCampaigns);
      
      // Update selected campaign if dialog is open
      if (selectedCampaign && selectedCampaign._id === campaignId) {
        const updatedCampaign = response.data.find((c: Campaign) => c._id === campaignId);
        if (updatedCampaign) {
          setSelectedCampaign(updatedCampaign);
        }
      }
      
      setSuccessMessage('You have successfully registered for the campaign!');
    } catch (err) {
      console.error('Error registering for campaign:', err);
      setError('Failed to register for campaign. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  
  // Unregister from campaign
  const handleUnregister = async (campaignId: string) => {
    if (!user) return;
    
    setUnregistering(true);
    try {
      await campaignService.unregisterFromCampaign(campaignId);
      
      // Update campaigns list
      const response = await campaignService.getAllCampaigns();
      setCampaigns(response.data);
      setFilteredCampaigns(response.data);
      
      // Update user's registered campaigns
      const userRegisteredCampaigns = response.data.filter((campaign: Campaign) => 
        campaign.participants?.some(participant => 
          typeof participant === 'string' ? participant === user._id : participant._id === user._id
        ) || false
      );
      setUserCampaigns(userRegisteredCampaigns);
      
      // Update selected campaign if dialog is open
      if (selectedCampaign && selectedCampaign._id === campaignId) {
        const updatedCampaign = response.data.find((c: Campaign) => c._id === campaignId);
        if (updatedCampaign) {
          setSelectedCampaign(updatedCampaign);
        }
      }
      
      setSuccessMessage('You have successfully unregistered from the campaign.');
    } catch (err) {
      console.error('Error unregistering from campaign:', err);
      setError('Failed to unregister from campaign. Please try again.');
    } finally {
      setUnregistering(false);
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
  
  // Check if user is registered for a campaign
  const isUserRegistered = (campaign: Campaign) => {
    if (!user) return false;
    return campaign.participants?.some(participant => 
      typeof participant === 'string' ? participant === user._id : participant._id === user._id
    ) || false;
  };
  
  // Check if campaign is upcoming
  const isUpcoming = (campaign: Campaign) => {
    const campaignDate = campaign.date || campaign.startDate;
    if (!campaignDate) return false;
    return new Date(campaignDate) > new Date();
  };
  
  // Render campaign card
  const renderCampaignCard = (campaign: Campaign) => {
    const upcoming = isUpcoming(campaign);
    const registered = isUserRegistered(campaign);
    
    return (
      <Card 
        elevation={3} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: '0.3s',
          '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
        }}
      >
        <CardMedia
          component="img"
          height="140"
          image={campaign.image || `https://source.unsplash.com/random/300x200?blood,donation&sig=${campaign._id}`}
          alt={campaign.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div" gutterBottom noWrap>
              {campaign.title}
            </Typography>
            {!upcoming && (
              <Chip label="Past" size="small" color="default" />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(campaign.date || campaign.startDate)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {campaign.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <People fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {campaign.participants?.length || 0} registered
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {campaign.description.substring(0, 100)}...
          </Typography>
        </CardContent>
        <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
          <Button 
            size="small" 
            onClick={() => handleOpenDetails(campaign)}
          >
            Learn More
          </Button>
          
          {upcoming && (
            registered ? (
              <Button 
                size="small" 
                color="error" 
                onClick={() => handleUnregister(campaign._id)}
                disabled={unregistering}
              >
                {unregistering ? 'Cancelling...' : 'Cancel Registration'}
              </Button>
            ) : (
              <Button 
                size="small" 
                variant="contained" 
                color="primary" 
                onClick={() => handleRegister(campaign._id)}
                disabled={registering}
              >
                {registering ? 'Registering...' : 'Register'}
              </Button>
            )
          )}
        </CardActions>
      </Card>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Blood Donation Campaigns
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="campaign tabs">
          <Tab label="All Campaigns" {...a11yProps(0)} />
          <Tab label="Your Registrations" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      {/* All Campaigns Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="search-campaigns">Search Campaigns</InputLabel>
            <OutlinedInput
              id="search-campaigns"
              value={searchQuery}
              onChange={handleSearch}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              label="Search Campaigns"
              placeholder="Search by title, location, or description"
            />
          </FormControl>
        </Box>
        
        {loadingCampaigns ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredCampaigns.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No campaigns found
            </Typography>
            {searchQuery && (
              <Typography variant="body1" color="textSecondary">
                Try adjusting your search criteria
              </Typography>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredCampaigns.map((campaign) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign._id}>
                {renderCampaignCard(campaign)}
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Your Registrations Tab */}
      <TabPanel value={tabValue} index={1}>
        {loadingCampaigns ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : userCampaigns.length === 0 ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              You haven't registered for any campaigns yet
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setTabValue(0)}
              sx={{ mt: 2 }}
            >
              Browse Campaigns
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {userCampaigns.map((campaign) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign._id}>
                {renderCampaignCard(campaign)}
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Campaign Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedCampaign && (
          <>
            <DialogTitle>{selectedCampaign.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <img 
                  src={selectedCampaign.image || `https://source.unsplash.com/random/800x400?blood,donation&sig=${selectedCampaign._id}`} 
                  alt={selectedCampaign.title} 
                  style={{ width: '100%', borderRadius: '4px', maxHeight: '300px', objectFit: 'cover' }}
                />
              </Box>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="h6" gutterBottom>
                    About This Campaign
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedCampaign.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Age between 18-65 years<br />
                    • Weight more than 45 kg<br />
                    • No major surgery in the last 6 months<br />
                    • No tattoo in the last 6 months<br />
                    • No major illness or medication
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Campaign Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Date:</strong> {selectedCampaign.date ? formatDate(selectedCampaign.date) : 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Location:</strong> {selectedCampaign.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <People fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Participants:</strong> {selectedCampaign.participants?.length || 0}
                      </Typography>
                    </Box>
                    
                    {isUpcoming(selectedCampaign) && (
                      <Box sx={{ mt: 3 }}>
                        {isUserRegistered(selectedCampaign) ? (
                          <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth
                            onClick={() => handleUnregister(selectedCampaign._id)}
                            disabled={unregistering}
                          >
                            {unregistering ? <CircularProgress size={24} /> : 'Cancel Registration'}
                          </Button>
                        ) : (
                          <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                            onClick={() => handleRegister(selectedCampaign._id)}
                            disabled={registering}
                          >
                            {registering ? <CircularProgress size={24} /> : 'Register Now'}
                          </Button>
                        )}
                      </Box>
                    )}
                  </Paper>
                  
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Organizer Contact
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" paragraph>
                      <strong>Name:</strong> {typeof selectedCampaign.organizer === 'object' ? selectedCampaign.organizer?.name : 'Admin'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Email:</strong> {typeof selectedCampaign.organizer === 'object' ? selectedCampaign.organizer?.email : 'admin@ambulancetracker.com'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {typeof selectedCampaign.organizer === 'object' ? selectedCampaign.organizer?.phone : '+1 (123) 456-7890'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
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

export default CampaignsPage;