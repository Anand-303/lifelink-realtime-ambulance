import mongoose, { Document } from 'mongoose';
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
declare let BloodRequest: mongoose.Model<IBloodRequest>;
export default BloodRequest;
//# sourceMappingURL=BloodRequest.d.ts.map