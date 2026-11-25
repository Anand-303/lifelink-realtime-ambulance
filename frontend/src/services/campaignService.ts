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

// Get all campaigns
export const getCampaigns = async (status?: string) => {
  const url = status
    ? `${API_URL}/api/campaigns?status=${status}`
    : `${API_URL}/api/campaigns`;
  const response = await axios.get(url);
  return response.data;
};

// Get campaign by ID
export const getCampaignById = async (id: string) => {
  const response = await axios.get(`${API_URL}/api/campaigns/${id}`);
  return response.data;
};

// Create a new campaign (admin only)
export const createCampaign = async (
  title: string,
  description: string,
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  },
  startDate: Date,
  endDate: Date,
  bloodGroupsNeeded: string[],
  token: string,
  image?: string
) => {
  const response = await axios.post(
    `${API_URL}/api/campaigns`,
    {
      title,
      description,
      location,
      startDate,
      endDate,
      bloodGroupsNeeded,
      image,
    },
    getConfig(token)
  );
  return response.data;
};

// Update campaign (admin only)
export const updateCampaign = async (
  id: string,
  campaignData: {
    title?: string;
    description?: string;
    location?: {
      address: string;
      latitude?: number;
      longitude?: number;
    };
    startDate?: Date;
    endDate?: Date;
    bloodGroupsNeeded?: string[];
    image?: string;
    status?: string;
  },
  token: string
) => {
  const response = await axios.put(
    `${API_URL}/api/campaigns/${id}`,
    campaignData,
    getConfig(token)
  );
  return response.data;
};

// Delete campaign (admin only)
export const deleteCampaign = async (id: string, token: string) => {
  const response = await axios.delete(`${API_URL}/api/campaigns/${id}`, getConfig(token));
  return response.data;
};

// Register for a campaign
export const registerForCampaign = async (id: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/api/campaigns/${id}/register`,
    {},
    getConfig(token)
  );
  return response.data;
};

// Unregister from a campaign
export const unregisterFromCampaign = async (id: string, token: string) => {
  const response = await axios.delete(
    `${API_URL}/api/campaigns/${id}/register`,
    getConfig(token)
  );
  return response.data;
};