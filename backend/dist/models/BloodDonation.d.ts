import mongoose, { Document } from 'mongoose';
export interface IBloodDonation extends Document {
    donor: mongoose.Types.ObjectId;
    bloodGroup: string;
    quantity: number;
    donationDate: Date;
    expiryDate: Date;
    status: 'available' | 'reserved' | 'used';
    hospital?: string;
}
declare const BloodDonation: mongoose.Model<IBloodDonation, {}, {}, {}, mongoose.Document<unknown, {}, IBloodDonation, {}, {}> & IBloodDonation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default BloodDonation;
//# sourceMappingURL=BloodDonation.d.ts.map