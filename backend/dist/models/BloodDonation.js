"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bloodDonationSchema = new mongoose_1.Schema({
    donor: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { timestamps: true });
// Set expiry date to 42 days (6 weeks) after donation date if not provided
bloodDonationSchema.pre('save', function (next) {
    if (!this.expiryDate) {
        const donationDate = this.donationDate || new Date();
        this.expiryDate = new Date(donationDate);
        this.expiryDate.setDate(this.expiryDate.getDate() + 42); // Blood typically expires after 42 days
    }
    next();
});
const BloodDonation = mongoose_1.default.model('BloodDonation', bloodDonationSchema);
exports.default = BloodDonation;
//# sourceMappingURL=BloodDonation.js.map