import mongoose, { Document } from 'mongoose';
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
declare const Ambulance: mongoose.Model<IAmbulance, {}, {}, {}, mongoose.Document<unknown, {}, IAmbulance, {}, {}> & IAmbulance & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Ambulance;
//# sourceMappingURL=Ambulance.d.ts.map