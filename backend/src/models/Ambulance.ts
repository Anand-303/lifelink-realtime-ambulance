import mongoose, { Document, Schema } from 'mongoose';

export interface IAmbulance extends Document {
  registrationNumber: string;
  driver: {
    name: string;
    phone: string;
  };
  location: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  status: 'available' | 'busy' | 'maintenance';
  currentRequest?: mongoose.Types.ObjectId;
}

const ambulanceSchema = new Schema<IAmbulance>(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
    },
    driver: {
      name: {
        type: String,
        required: [true, 'Driver name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Driver phone is required'],
        trim: true,
      },
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'maintenance'],
      default: 'available',
    },
    currentRequest: {
      type: Schema.Types.ObjectId,
      ref: 'AmbulanceRequest',
    },
  },
  { timestamps: true }
);

const Ambulance = mongoose.model<IAmbulance>('Ambulance', ambulanceSchema);

export default Ambulance;