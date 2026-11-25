import axios from 'axios';
import { BloodRequest } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios with token
const getConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Register as a blood donor
export const registerAsDonor = async (bloodGroup: string, token: string, lastDonationDate?: Date) => {
  const response = await axios.put(
    `${API_URL}/api/blood-donation/register-donor`,
    { bloodGroup, lastDonationDate },
    getConfig(token)
  );
  return response.data;
};

// Get all blood donors
export const getDonors = async (token: string, bloodGroup?: string) => {
  const url = bloodGroup
    ? `${API_URL}/api/blood-donation/donors?bloodGroup=${bloodGroup}`
    : `${API_URL}/api/blood-donation/donors`;
  const response = await axios.get(url, getConfig(token));
  return response.data;
};

// Record a blood donation
export const recordBloodDonation = async (
  donorId: string,
  bloodGroup: string,
  quantity: number,
  donationDate: Date,
  hospital: string | undefined,
  token: string
) => {
  const response = await axios.post(
    `${API_URL}/api/blood-donation`,
    {
      donorId,
      bloodGroup,
      quantity,
      donationDate,
      hospital,
    },
    getConfig(token)
  );
  return response.data;
};

// Get blood inventory
export const getBloodInventory = async (token: string) => {
  const response = await axios.get(`${API_URL}/api/blood-inventory`, getConfig(token));
  return response.data;
};

// Using BloodRequest type from types/index.ts

// Simple function to submit a blood request
export const submitBloodRequest = async (data: {
  patientName: string;
  patientContact: string;
  bloodGroup: string;
  quantity: number;
  hospital: string;
  reason?: string;
}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Please log in to submit a blood request');
  }

  const response = await axios.post(
    `${API_URL}/api/blood/request`,
    data,
    getConfig(token)
  );
  
  return response.data as BloodRequest;
};

// Get all blood requests (for admin)
export const getBloodRequests = async (): Promise<BloodRequest[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await axios.get(
    `${API_URL}/api/blood/requests`,
    getConfig(token)
  );
  
  return response.data;
};

// Update request status (for admin)
export const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected' | 'fulfilled'): Promise<BloodRequest> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await axios.put(
    `${API_URL}/api/blood/request/${requestId}/status`,
    { status },
    getConfig(token)
  );
  
  return response.data;
};

// Get user's blood requests
export const getUserBloodRequests = async (): Promise<BloodRequest[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Please log in to view your requests');
  }
  
  const response = await axios.get(
    `${API_URL}/api/blood/requests/my-requests`,
    getConfig(token)
  );
  
  return response.data;
};

// Get blood request by ID
export const getBloodRequestById = async (id: string): Promise<BloodRequest> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  
  const response = await axios.get(
    `${API_URL}/api/blood-donation/requests/${id}`,
    getConfig(token)
  );
  return response.data;
};

// Update blood request status (admin only)
export const updateBloodRequestStatus = async (
  requestId: string, 
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected',
  adminNotes?: string
): Promise<BloodRequest> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await axios.put(
    `${API_URL}/api/blood-donation/requests/${requestId}/status`,
    { status, adminNotes },
    getConfig(token)
  );
  return response.data;
};

// This function was a duplicate and has been removed