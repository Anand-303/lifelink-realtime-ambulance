import React from 'react';
import AdminDashboardNew from './AdminDashboardNew';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminDashboardNew />;
};

export default AdminDashboardPage;