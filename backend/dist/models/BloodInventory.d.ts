import mongoose, { Document } from 'mongoose';
import { IUser } from './User';
export interface IBloodInventory extends Document {
    bloodGroup: string;
    units: number;
    lastUpdated: Date;
    updatedBy: mongoose.Types.ObjectId | IUser;
}
declare let BloodInventory: mongoose.Model<IBloodInventory>;
export default BloodInventory;
//# sourceMappingURL=BloodInventory.d.ts.map