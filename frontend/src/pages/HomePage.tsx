import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CampaignIcon from '@mui/icons-material/Campaign';

const HomePage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/hero-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Emergency Medical Services at Your Fingertips
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Track ambulances in real-time, request emergency services, and contribute to blood donation campaigns
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              component={RouterLink} 
              to="/book-ambulance" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ mr: 2, mb: 2, px: 4, py: 1.5, borderRadius: '30px' }}
            >
              Book Ambulance
            </Button>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="outlined" 
              color="secondary" 
              size="large"
              sx={{ mb: 2, px: 4, py: 1.5, borderRadius: '30px', color: 'white', borderColor: 'white' }}
            >
              Track Ambulance
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Our Services
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
          Comprehensive emergency medical services platform designed to save lives
        </Typography>

        <Grid container spacing={4}>
          {/* Ambulance Tracking */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <DirectionsCarIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Ambulance Tracking
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Track ambulances in real-time and request emergency services when needed
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Blood Donation */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <VolunteerActivismIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Blood Donation
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Register as a donor, find blood donors, and request blood in emergencies
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Campaigns */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <CampaignIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Campaigns
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Join blood donation campaigns and community health initiatives
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Medical Services */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-10px)', boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <LocalHospitalIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Medical Services
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Access emergency medical services and healthcare resources
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Ready to Save Lives?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Join our platform today and be part of our life-saving community
          </Typography>
          <Button 
            component={RouterLink} 
            to="/register" 
            variant="contained" 
            color="secondary" 
            size="large"
            sx={{ px: 4, py: 1.5, borderRadius: '30px' }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;