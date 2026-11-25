import mongoose, { Document, Schema } from 'mongoose';

export interface IAmbulanceRequest extends Document {
  user: mongoose.Types.ObjectId;
  patientName: string;
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
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  ambulance?: mongoose.Types.ObjectId;
  emergencyDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ambulanceRequestSchema = new Schema<IAmbulanceRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },
    needsBlood: {
      type: Boolean,
      default: false,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'critical'],
      default: 'medium',
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup address is required'],
      },
      latitude: {
        type: Number,
        required: [true, 'Pickup latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Pickup longitude is required'],
      },
    },
    destination: {
      address: {
        type: String,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    ambulance: {
      type: Schema.Types.ObjectId,
      ref: 'Ambulance',
    },
    emergencyDetails: {
      type: String,
    },
  },
  { timestamps: true }
);

const AmbulanceRequest = mongoose.model<IAmbulanceRequest>('AmbulanceRequest', ambulanceRequestSchema);

export default AmbulanceRequest;