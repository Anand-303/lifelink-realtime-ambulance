import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios with token
const getConfig = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all ambulances (admin only)
export const getAmbulances = async (token: string) => {
  const response = await axios.get(`${API_URL}/api/ambulance`, getConfig(token));
  return response.data;
};

// Get ambulance by ID
export const getAmbulanceById = async (id: string, token: string) => {
  const response = await axios.get(`${API_URL}/api/ambulance/${id}`, getConfig(token));
  return response.data;
};

// Update ambulance location
export const updateAmbulanceLocation = async (id: string, latitude: number, longitude: number, token: string) => {
  const response = await axios.put(
    `${API_URL}/api/ambulance/${id}/location`,
    { latitude, longitude },
    getConfig(token)
  );
  return response.data;
};

// Request an ambulance
export const requestAmbulance = async (
  patientName: string,
  patientPhone: string,
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  },
  token: string,
  destination?: {
    address: string;
    latitude: number;
    longitude: number;
  },
  emergencyDetails?: string
) => {
  const response = await axios.post(
    `${API_URL}/api/ambulance/request`,
    {
      patientName,
      patientPhone,
      pickupLocation,
      destination,
      emergencyDetails,
    },
    getConfig(token)
  );
  return response.data;
};

// Get ambulance request by ID
export const getAmbulanceRequestById = async (id: string, token: string) => {
  const response = await axios.get(`${API_URL}/api/ambulance/request/${id}`, getConfig(token));
  return response.data;
};

// Update ambulance request status
export const updateAmbulanceRequestStatus = async (id: string, status: string, token: string) => {
  const response = await axios.put(
    `${API_URL}/api/ambulance/request/${id}/status`,
    { status },
    getConfig(token)
  );
  return response.data;
};

// Get user's ambulance requests
export const getUserAmbulanceRequests = async (token: string) => {
  const response = await axios.get(`${API_URL}/api/ambulance/request/user`, getConfig(token));
  return response.data;
};