import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, useTheme } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const BookAmbulancePage: React.FC = () => {
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
            Book an Ambulance
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Quick and reliable ambulance booking service for emergency and non-emergency medical transportation
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ mr: 2, mb: 2, px: 4, py: 1.5, borderRadius: '30px' }}
            >
              Emergency Booking
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="large"
              sx={{ mb: 2, px: 4, py: 1.5, borderRadius: '30px', color: 'white', borderColor: 'white' }}
            >
              Schedule Booking
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Booking Options */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Choose Your Service
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
          Select the type of ambulance service you need
        </Typography>

        <Grid container spacing={4}>
          {/* Emergency Service */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 4, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <LocalHospitalIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h4" component="h3" gutterBottom color="error">
                  Emergency Service
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  For life-threatening emergencies and critical medical situations
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  Response Time: 5-10 minutes
                </Typography>
                <Button 
                  variant="contained" 
                  color="error" 
                  size="large"
                  sx={{ px: 4, py: 1.5, borderRadius: '30px', mt: 2 }}
                >
                  Book Emergency
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Non-Emergency Service */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 4, height: '100%', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <LocalHospitalIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h4" component="h3" gutterBottom>
                  Non-Emergency Service
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  For scheduled medical appointments, transfers, and routine transport
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  Response Time: 30-45 minutes
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ px: 4, py: 1.5, borderRadius: '30px', mt: 2 }}
                >
                  Schedule Transfer
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Contact Information */}
      <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Need Immediate Assistance?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Call our 24/7 emergency hotline for immediate ambulance dispatch
          </Typography>
          
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  108
                </Typography>
                <Typography variant="body2">
                  Emergency Number
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PhoneIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  1800-XXX-XXXX
                </Typography>
                <Typography variant="body2">
                  Helpline
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  24/7 Service
                </Typography>
                <Typography variant="body2">
                  Always Available
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default BookAmbulancePage;
