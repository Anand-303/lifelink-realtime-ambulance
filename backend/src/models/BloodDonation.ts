import mongoose, { Document, Schema } from 'mongoose';

export interface IBloodDonation extends Document {
  donor: mongoose.Types.ObjectId;
  bloodGroup: string;
  quantity: number; // in units
  donationDate: Date;
  expiryDate: Date;
  status: 'available' | 'reserved' | 'used';
  hospital?: string;
}

const bloodDonationSchema = new Schema<IBloodDonation>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1 unit'],
    },
    donationDate: {
      type: Date,
      required: [true, 'Donation date is required'],
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'used'],
      default: 'available',
    },
    hospital: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Set expiry date to 42 days (6 weeks) after donation date if not provided
bloodDonationSchema.pre('save', function (next) {
  if (!this.expiryDate) {
    const donationDate = this.donationDate || new Date();
    this.expiryDate = new Date(donationDate);
    this.expiryDate.setDate(this.expiryDate.getDate() + 42); // Blood typically expires after 42 days
  }
  next();
});

const BloodDonation = mongoose.model<IBloodDonation>('BloodDonation', bloodDonationSchema);

export default BloodDonation;