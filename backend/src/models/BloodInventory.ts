import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IBloodInventory extends Document {
  bloodGroup: string;
  units: number;
  lastUpdated: Date;
  updatedBy: mongoose.Types.ObjectId | IUser;
}

const bloodInventorySchema = new Schema<IBloodInventory>({
  bloodGroup: {
    type: String,
    required: true,
    unique: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create model if it doesn't exist
let BloodInventory: mongoose.Model<IBloodInventory>;
if (mongoose.models.BloodInventory) {
  BloodInventory = mongoose.models.BloodInventory as mongoose.Model<IBloodInventory>;
} else {
  BloodInventory = mongoose.model<IBloodInventory>('BloodInventory', bloodInventorySchema);
}

export default BloodInventory;
