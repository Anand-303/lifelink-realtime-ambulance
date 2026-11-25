import React, { useEffect, useMemo, useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAppSelector } from '../../redux/hooks';
import { AmbulanceRequest, BloodRequest, Campaign } from '../../types';
import { ambulanceService } from '../../services/api';
import * as campaignService from '../../services/campaignService';
import * as bloodDonationService from '../../services/bloodDonationService';
import LifeLinkMap from '../../components/LifeLinkMap';

const DashboardPage: React.FC = () => {
  const { user, token } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [ambulanceRequests, setAmbulanceRequests] = useState<AmbulanceRequest[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [upcomingCampaigns, setUpcomingCampaigns] = useState<Campaign[]>([]);
  const latestAmbulanceRequest = useMemo(
    () => (ambulanceRequests && ambulanceRequests.length > 0 ? ambulanceRequests[0] : null),
    [ambulanceRequests]
  );
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user's ambulance requests
        const ambulanceRes = await ambulanceService.getUserAmbulanceRequests();
        setAmbulanceRequests(Array.isArray(ambulanceRes) ? ambulanceRes : []);
        
        // Fetch user's blood requests
        const bloodRes = await bloodDonationService.getUserBloodRequests();
        // Ensure the response is treated as BloodRequest array
        setBloodRequests(bloodRes as BloodRequest[]);
        
        // Fetch upcoming campaigns
        const campaignsRes = await campaignService.getCampaigns();
        // Filter for upcoming campaigns and limit to 3
        const upcoming = campaignsRes
          .filter((campaign: Campaign) => campaign.date && new Date(campaign.date) > new Date())
          .sort((a: Campaign, b: Campaign) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateA - dateB;
          })
          .slice(0, 3);
        setUpcomingCampaigns(upcoming);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(to right, #e53935, #e35d5b)', 
          color: 'white' 
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1">
          This is your dashboard where you can track your ambulance requests, blood donation activities, and upcoming campaigns.
        </Typography>
      </Paper>
      
      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Button 
                  component={RouterLink} 
                  to="/ambulance" 
                  variant="outlined" 
                  color="primary" 
                  fullWidth 
                  startIcon={<DirectionsCarIcon />}
                  sx={{ mb: 2 }}
                >
                  Book Ambulance
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button 
                  component={RouterLink} 
                  to="/ambulance" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  startIcon={<DirectionsCarIcon />}
                  sx={{ mb: 2 }}
                >
                  Ambulance Tracking
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button 
                  component={RouterLink} 
                  to="/blood-donation" 
                  variant="contained" 
                  color="secondary" 
                  fullWidth 
                  startIcon={<LocalHospitalIcon />}
                  sx={{ mb: 2 }}
                >
                  Blood Donation
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button 
                  component={RouterLink} 
                  to="/campaigns" 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  startIcon={<CampaignIcon />}
                >
                  View Campaigns
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Recent Requests */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Recent Requests
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {latestAmbulanceRequest && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Latest Ambulance Booking
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Status:</strong> {latestAmbulanceRequest.status}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Pickup:</strong> {latestAmbulanceRequest.pickupLocation.address}
                </Typography>
                {latestAmbulanceRequest.needsBlood != null && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Need blood:</strong> {latestAmbulanceRequest.needsBlood ? 'Yes' : 'No'}
                  </Typography>
                )}
                {latestAmbulanceRequest.urgency && (
                  <Typography variant="body2">
                    <strong>Urgency:</strong> {latestAmbulanceRequest.urgency}
                  </Typography>
                )}
              </Paper>
            )}
            
            {ambulanceRequests.length === 0 && bloodRequests.length === 0 ? (
              <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
                You don't have any recent requests.
              </Typography>
            ) : (
              <List>
                {/* Ambulance Requests */}
                {ambulanceRequests.slice(0, 3).map((request) => (
                  <ListItem key={request._id} divider>
                    <ListItemIcon>
                      <DirectionsCarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Ambulance Request: ${request.pickupLocation.address}`}
                      secondary={`Status: ${request.status} • ${formatDate(request.createdAt)}`}
                    />
                  </ListItem>
                ))}
                
                {/* Blood Requests */}
                {bloodRequests.slice(0, 3).map((request) => (
                  <ListItem key={request._id} divider>
                    <ListItemIcon>
                      <LocalHospitalIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Blood Request: ${request.bloodGroup} (${request.quantity} units)`}
                      secondary={`Status: ${request.status} • ${formatDate(request.createdAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            {(ambulanceRequests.length > 0 || bloodRequests.length > 0) && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  component={RouterLink} 
                  to="/profile" 
                  color="primary"
                >
                  View All Requests
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Upcoming Campaigns */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Campaigns
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {upcomingCampaigns.length === 0 ? (
              <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
                There are no upcoming campaigns at the moment.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {upcomingCampaigns.map((campaign) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign._id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {campaign.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {formatDate(campaign.date)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {campaign.location}
                        </Typography>
                        <Typography variant="body2" noWrap>
                          {campaign.description.substring(0, 100)}...
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          component={RouterLink} 
                          to={`/campaigns/${campaign._id}`} 
                          size="small" 
                          color="primary"
                        >
                          Learn More
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                component={RouterLink} 
                to="/campaigns" 
                color="primary"
              >
                View All Campaigns
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Nearby hospitals map (Life Link) */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nearby hospitals
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Your location and nearby hospitals. Allow location access to center the map and see hospitals.
            </Typography>
            <LifeLinkMap height={400} showNearbyHospitals />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;