import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from '../Chatbot';
import { useAppSelector } from '../../redux/hooks';

const MainLayout: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Footer />
      {/* Show chatbot only when user is authenticated */}
      {token && <Chatbot />}
    </Box>
  );
};

export default MainLayout;