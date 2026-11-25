import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LocalHospital, Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospital sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                MediConnect
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400' }}>
              Connecting people with emergency medical services and blood donation opportunities.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/ambulance" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Ambulance Services
            </Link>
            <Link component={RouterLink} to="/blood-donation" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Blood Donation
            </Link>
            <Link component={RouterLink} to="/campaigns" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Campaigns
            </Link>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Link href="#" color="inherit">
                <Facebook />
              </Link>
              <Link href="#" color="inherit">
                <Twitter />
              </Link>
              <Link href="#" color="inherit">
                <Instagram />
              </Link>
              <Link href="#" color="inherit">
                <LinkedIn />
              </Link>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400' }}>
              Email: info@mediconnect.com
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400' }}>
              Phone: +1 (123) 456-7890
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3} pt={3} borderTop={1} borderColor="grey.800">
          <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'grey.500' }}>
            {'© '}
            {new Date().getFullYear()}
            {' MediConnect. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;