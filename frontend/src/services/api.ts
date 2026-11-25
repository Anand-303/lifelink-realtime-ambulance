import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Prevent requests from hanging forever in the UI
  timeout: 15000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Status service for checking API connection
export { default as statusService } from './statusService';

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getUserProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateUserProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  // Admin methods
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },
  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/auth/users/${userId}`, userData);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },
};

// Ambulance services
export const ambulanceService = {
  getAllAmbulances: async () => {
    const response = await api.get('/ambulance');
    return response.data;
  },
  getAmbulanceById: async (id: string) => {
    const response = await api.get(`/ambulance/${id}`);
    return response.data;
  },
  createAmbulance: async (ambulanceData: any) => {
    const response = await api.post('/ambulance', ambulanceData);
    return response.data;
  },
  deleteAmbulance: async (id: string) => {
    const response = await api.delete(`/ambulance/${id}`);
    return response.data;
  },
  updateAmbulanceLocation: async (id: string, location: { latitude: number; longitude: number }) => {
    const response = await api.put(`/ambulance/${id}/location`, { location });
    return response.data;
  },
  updateAmbulanceStatus: async (id: string, status: string) => {
    const response = await api.put(`/ambulance/${id}/status`, { status });
    return response.data;
  },
  createAmbulanceRequest: async (requestData: any) => {
    const response = await api.post('/ambulance/request', requestData);
    return response.data;
  },
  getAmbulanceRequestById: async (id: string) => {
    const response = await api.get(`/ambulance/request/${id}`);
    return response.data;
  },
  getUserAmbulanceRequests: async () => {
    const response = await api.get('/ambulance/request/user');
    return response.data;
  },
  getAllAmbulanceRequests: async () => {
    const response = await api.get('/ambulance/request/all');
    return response.data;
  },
  updateAmbulanceRequestStatus: async (id: string, status: string) => {
    const response = await api.put(`/ambulance/request/${id}/status`, { status });
    return response.data;
  },
  allocateAmbulanceToRequest: async (id: string, ambulanceId: string) => {
    const response = await api.put(`/ambulance/request/${id}/allocate`, { ambulanceId });
    return response.data;
  },
};

// Blood donation services
export const bloodDonationService = {
  registerAsDonor: async (donorData: any) => {
    const response = await api.put('/blood-donation/register-donor', donorData);
    return response.data;
  },
  getDonors: async (bloodGroup?: string) => {
    const url = bloodGroup ? `/blood-donation/donors?bloodGroup=${bloodGroup}` : '/blood-donation/donors';
    const response = await api.get(url);
    return response.data;
  },
  recordBloodDonation: async (donationData: any) => {
    const response = await api.post('/blood-donation', donationData);
    return response.data;
  },
  getBloodInventory: async () => {
    const response = await api.get('/blood-inventory');
    return response.data;
  },
  requestBlood: async (requestData: any) => {
    const response = await api.post('/blood-donation/request', requestData);
    return response.data;
  },
  getBloodRequestById: async (id: string) => {
    const response = await api.get(`/blood-donation/request/${id}`);
    return response.data;
  },
  getUserBloodRequests: async () => {
    const response = await api.get('/blood-donation/request/user');
    return response.data;
  },
  getAllBloodRequests: async () => {
    const response = await api.get('/blood-donation/request/all');
    return response.data;
  },
  updateBloodRequestStatus: async (id: string, status: string) => {
    const response = await api.put(`/blood-donation/request/${id}/status`, { status });
    return response.data;
  },
};

// Blood inventory services (admin only for updates)
export const bloodInventoryService = {
  getBloodInventory: async () => {
    const response = await api.get('/blood-inventory');
    return response.data;
  },
  updateBloodInventory: async (bloodGroup: string, units: number) => {
    // URL encode the blood group to handle special characters like '+'
    const encodedBloodGroup = encodeURIComponent(bloodGroup);
    const response = await api.put(`/blood-inventory/${encodedBloodGroup}`, { units });
    return response.data;
  },
  deleteBloodInventory: async (bloodGroup: string) => {
    // URL encode the blood group to handle special characters like '+'
    const encodedBloodGroup = encodeURIComponent(bloodGroup);
    const response = await api.delete(`/blood-inventory/${encodedBloodGroup}`);
    return response.data;
  },
};

// Campaign services
export const campaignService = {
  getAllCampaigns: async (status?: string) => {
    const url = status ? `/campaigns?status=${status}` : '/campaigns';
    const response = await api.get(url);
    return response.data;
  },
  getCampaignById: async (id: string) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },
  createCampaign: async (campaignData: any) => {
    console.log('API: Creating campaign with data:', campaignData);
    try {
      const response = await api.post('/campaigns', campaignData);
      console.log('API: Campaign create response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Campaign create error:', error);
      console.error('API: Campaign create error response:', error.response);
      throw error;
    }
  },
  updateCampaign: async (id: string, campaignData: any) => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },
  deleteCampaign: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
  registerForCampaign: async (id: string) => {
    const response = await api.post(`/campaigns/${id}/register`);
    return response.data;
  },
  unregisterFromCampaign: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}/register`);
    return response.data;
  },
};

export default api;