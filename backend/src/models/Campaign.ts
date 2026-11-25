import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  organizer: mongoose.Types.ObjectId;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  startDate: Date;
  endDate: Date;
  bloodGroupsNeeded?: string[];
  image?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  participants?: mongoose.Types.ObjectId[];
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    bloodGroupsNeeded: [{
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    }],
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { timestamps: true }
);

// Update status based on dates
campaignSchema.pre('save', function (next) {
  const now = new Date();
  
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'ongoing';
  } else if (now > this.endDate) {
    this.status = 'completed';
  }
  
  next();
});

const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

export default Campaign;