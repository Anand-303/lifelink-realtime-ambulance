import mongoose, { Document } from 'mongoose';
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
declare const Campaign: mongoose.Model<ICampaign, {}, {}, {}, mongoose.Document<unknown, {}, ICampaign, {}, {}> & ICampaign & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Campaign;
//# sourceMappingURL=Campaign.d.ts.map