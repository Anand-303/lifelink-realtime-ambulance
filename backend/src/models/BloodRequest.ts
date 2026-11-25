import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IBloodRequest extends Document {
  patientName: string;
  patientAge: number;
  bloodGroup: string;
  units: number;
  hospital: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  contactNumber: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  requestedBy: mongoose.Types.ObjectId | IUser;
  processedBy?: mongoose.Types.ObjectId | IUser;
  processedAt?: Date;
  fulfilledBy?: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bloodRequestSchema = new Schema<IBloodRequest>({
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true, min: 1, max: 120 },
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: { type: Number, required: true, min: 1, max: 10 },
  hospital: { type: String, required: true },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  contactNumber: { type: String, required: true },
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  fulfilledBy: [{
    type: Schema.Types.ObjectId,
    ref: 'BloodDonation'
  }],
  notes: String
}, { timestamps: true });

// Create model if it doesn't exist
let BloodRequest: mongoose.Model<IBloodRequest>;
if (mongoose.models.BloodRequest) {
  BloodRequest = mongoose.models.BloodRequest as mongoose.Model<IBloodRequest>;
} else {
  BloodRequest = mongoose.model<IBloodRequest>('BloodRequest', bloodRequestSchema);
}

export default BloodRequest;