// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'driver';
  phone?: string;
  address?: string;
  bloodGroup?: string;
  isDonor?: boolean;
  lastDonationDate?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Ambulance types
export interface Ambulance {
  _id: string;
  registrationNumber: string;
  driver: {
    name: string;
    phone: string;
    _id?: string;
  };
  location: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  status: 'available' | 'busy' | 'maintenance';
  currentRequest?: string;
}

export interface AmbulanceRequest {
  _id: string;
  user: User | string;
  patientName: string;
  patientContact: string;
  patientPhone?: string;
  needsBlood?: boolean;
  urgency?: 'low' | 'medium' | 'critical';
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination?: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  destinationLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  ambulance?: Ambulance | string;
  createdAt: string;
  updatedAt: string;
}

// Blood donation types
export interface BloodDonation {
  _id: string;
  donor: User | string;
  bloodGroup: string;
  quantity: number;
  donationDate: string;
  expiryDate: string;
  status: 'available' | 'used' | 'expired';
  hospital?: string;
}

export interface BloodRequest {
  _id: string;
  requester: User | string;
  patientName: string;
  patientAge: number;
  patientContact: string;
  bloodGroup: string;
  quantity: number;
  hospital: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  assignedTo?: string;
  adminNotes?: string;
  requiredDate?: string | Date;
  createdAt: string;
  updatedAt: string;
}

// Map & Places types (for Life Link map and nearby hospitals)
export interface HospitalPlace {
  placeId: string;
  name: string;
  vicinity?: string;
  lat: number;
  lng: number;
  rating?: number;
}

// Campaign types
export interface Campaign {
  _id: string;
  title: string;
  description: string;
  organizer: User | string;
  location: string;
  date?: string; // Added for backward compatibility
  startDate: string;
  endDate: string;
  bloodGroupsNeeded: string[];
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  participants?: User[] | string[];
  createdAt: string;
  updatedAt: string;
}