export interface BloodInventoryItem {
  _id: string;
  bloodGroup: string;
  units: number;
  lastUpdated: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

export interface BloodRequest {
  _id: string;
  patientName: string;
  patientAge: number;
  bloodGroup: string;
  units: number;
  hospital: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  contactNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donor {
  _id: string;
  userId: string;
  name: string;
  bloodGroup: string;
  phone?: string;
  lastDonation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
