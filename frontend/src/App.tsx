import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './App.css';

// Layout and Common Components
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import ScrollToTop from './components/common/ScrollToTop';

// Pages - will be created later
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/Auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard/DashboardPage'));
const AmbulanceTrackingPage = React.lazy(() => import('./pages/Ambulance/AmbulanceTrackingPage'));
const BookAmbulancePage = React.lazy(() => import('./pages/BookAmbulancePage'));
const BloodDonationPage = React.lazy(() => import('./pages/Blood/BloodDonationPage'));
const CampaignsPage = React.lazy(() => import('./pages/Campaigns/CampaignsPage'));
const ProfilePage = React.lazy(() => import('./pages/Profile/ProfilePage'));
const AdminDashboardPage = React.lazy(() => import('./pages/Admin/AdminDashboardPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#e53935', // Red color for ambulance theme
    },
    secondary: {
      main: '#1e88e5', // Blue color for contrast
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
            <ScrollToTop />
            <React.Suspense fallback={<LoadingSpinner />}>
              <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="book-ambulance" element={<BookAmbulancePage />} />
              
              {/* Protected routes */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="ambulance" element={
                <ProtectedRoute>
                  <AmbulanceTrackingPage />
                </ProtectedRoute>
              } />
              <Route path="blood-donation" element={
                <ProtectedRoute>
                  <BloodDonationPage />
                </ProtectedRoute>
              } />
              <Route path="campaigns" element={
                <ProtectedRoute>
                  <CampaignsPage />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </React.Suspense>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
