"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBloodRequests = exports.updateBloodRequestStatus = exports.getUserBloodRequests = exports.getBloodRequestById = exports.requestBlood = exports.getBloodInventory = exports.recordBloodDonation = exports.getDonors = exports.registerAsDonor = void 0;
const mongoose_1 = require("mongoose");
const BloodDonation_1 = __importDefault(require("../models/BloodDonation"));
const BloodRequest_1 = __importDefault(require("../models/BloodRequest"));
const User_1 = __importDefault(require("../models/User"));
// Use the same Request type extension from middleware/auth.ts
// No need to redeclare - it's already declared in auth.ts
/**
 * Register as a blood donor
 * @route PUT /api/blood-donation/register-donor
 * @access Private
 */
const registerAsDonor = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = await User_1.default.findById(req.user._id);
        if (user) {
            user.isDonor = true;
            user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
            user.lastDonationDate = req.body.lastDonationDate || user.lastDonationDate;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                bloodGroup: updatedUser.bloodGroup,
                isDonor: updatedUser.isDonor,
                lastDonationDate: updatedUser.lastDonationDate,
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.registerAsDonor = registerAsDonor;
/**
 * Get all blood donors
 * @route GET /api/blood-donation/donors
 * @access Private
 */
const getDonors = async (req, res) => {
    try {
        const { bloodGroup } = req.query;
        const filter = { isDonor: true };
        if (bloodGroup) {
            filter.bloodGroup = bloodGroup;
        }
        const donors = await User_1.default.find(filter).select('-password');
        res.json(donors);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getDonors = getDonors;
/**
 * Record a blood donation
 * @route POST /api/blood-donation
 * @access Private
 */
const recordBloodDonation = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { bloodGroup, quantity, donationDate, hospital } = req.body;
        // Create blood donation record
        const bloodDonation = await BloodDonation_1.default.create({
            donor: req.user._id,
            bloodGroup,
            quantity,
            donationDate: donationDate || new Date(),
            hospital,
        });
        // Update user's last donation date
        await User_1.default.findByIdAndUpdate(req.user._id, {
            lastDonationDate: donationDate || new Date(),
        });
        res.status(201).json(bloodDonation);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.recordBloodDonation = recordBloodDonation;
/**
 * Get blood inventory
 * @route GET /api/blood-donation/inventory
 * @access Private
 */
const getBloodInventory = async (req, res) => {
    try {
        const inventory = await BloodDonation_1.default.aggregate([
            { $match: { status: 'available' } },
            {
                $group: {
                    _id: '$bloodGroup',
                    totalUnits: { $sum: '$quantity' },
                    donations: { $push: '$$ROOT' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json(inventory);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getBloodInventory = getBloodInventory;
/**
 * Request blood
 * @route POST /api/blood-donation/request
 * @access Private
 */
const requestBlood = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (!req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { patientName, patientAge, bloodGroup, units, hospital, urgency = 'medium', contactNumber, reason, } = req.body;
        // Validate required fields
        if (!patientName || !patientAge || !bloodGroup || !units || !hospital || !contactNumber) {
            return res.status(400).json({
                message: 'Missing required fields: patientName, patientAge, bloodGroup, units, hospital, contactNumber'
            });
        }
        // Convert user._id to ObjectId if it's a string
        const user = req.user;
        let requestedById;
        if (user._id instanceof mongoose_1.Types.ObjectId) {
            requestedById = user._id;
        }
        else {
            requestedById = new mongoose_1.Types.ObjectId(String(user._id));
        }
        // Convert and validate numeric fields
        const patientAgeNum = Number(patientAge);
        const unitsNum = Number(units);
        // Validate data before creating
        if (isNaN(patientAgeNum) || patientAgeNum < 1 || patientAgeNum > 120) {
            return res.status(400).json({ message: 'Invalid patient age. Must be between 1 and 120' });
        }
        if (isNaN(unitsNum) || unitsNum < 1 || unitsNum > 10) {
            return res.status(400).json({ message: 'Invalid units. Must be between 1 and 10' });
        }
        // Create blood request
        const bloodRequestData = {
            patientName: patientName.trim(),
            patientAge: patientAgeNum,
            bloodGroup: bloodGroup.trim(),
            units: unitsNum,
            hospital: hospital.trim(),
            urgency: urgency || 'medium',
            contactNumber: contactNumber.trim(),
            reason: reason ? reason.trim() : undefined,
            requestedBy: requestedById,
            status: 'pending'
        };
        const bloodRequest = new BloodRequest_1.default(bloodRequestData);
        await bloodRequest.save();
        // Inventory management can be implemented here if needed
        res.status(201).json(bloodRequest);
    }
    catch (error) {
        console.error('Error creating blood request:', error);
        // Provide more detailed error messages
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors || {}).map((err) => err.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: validationErrors
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: `Invalid data format: ${error.message}`
            });
        }
        res.status(500).json({
            message: error.message || 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.requestBlood = requestBlood;
/**
 * Get blood request by ID
 * @route GET /api/blood-donation/request/:id
 * @access Private
 */
const getBloodRequestById = async (req, res) => {
    try {
        const requestId = req.params?.id;
        if (!requestId || !mongoose_1.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'Invalid blood request ID' });
        }
        const bloodRequest = await BloodRequest_1.default.findById(requestId)
            .populate('requestedBy', 'name email')
            .populate('processedBy', 'name email')
            .lean()
            .exec();
        if (!bloodRequest) {
            return res.status(404).json({ message: 'Blood request not found' });
        }
        res.json(bloodRequest);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getBloodRequestById = getBloodRequestById;
/**
 * Get user's blood requests
 * @route GET /api/blood-donation/request/user
 * @access Private
 */
const getUserBloodRequests = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = req.user;
        if (!user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = user._id instanceof mongoose_1.Types.ObjectId
            ? user._id
            : new mongoose_1.Types.ObjectId(String(user._id));
        const bloodRequests = await BloodRequest_1.default.find({
            requestedBy: userId
        })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        res.json(bloodRequests);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getUserBloodRequests = getUserBloodRequests;
/**
 * Update blood request status
 * @route PUT /api/blood-donation/request/:id/status
 * @access Private/Admin
 */
const updateBloodRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const requestId = req.params?.id;
        if (!requestId || !mongoose_1.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'Invalid blood request ID' });
        }
        const bloodRequest = await BloodRequest_1.default.findById(requestId);
        if (bloodRequest) {
            bloodRequest.status = status;
            // If request is fulfilled, update the blood donation status to used
            if (status === 'fulfilled' && bloodRequest.fulfilledBy) {
                for (const donationId of bloodRequest.fulfilledBy) {
                    await BloodDonation_1.default.findByIdAndUpdate(donationId, { status: 'used' });
                }
            }
            // If request is cancelled, return the blood to inventory
            if (status === 'cancelled' && bloodRequest.fulfilledBy) {
                for (const donationId of bloodRequest.fulfilledBy) {
                    await BloodDonation_1.default.findByIdAndUpdate(donationId, { status: 'available' });
                }
                bloodRequest.fulfilledBy = [];
            }
            const updatedRequest = await bloodRequest.save();
            res.json(updatedRequest);
        }
        else {
            res.status(404).json({ message: 'Blood request not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.updateBloodRequestStatus = updateBloodRequestStatus;
/**
 * Get all blood requests (Admin only)
 * @route GET /api/blood-donation/request/all
 * @access Private/Admin
 */
const getAllBloodRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const bloodRequests = await BloodRequest_1.default.find(query)
            .populate('requestedBy', 'name email')
            .populate('processedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        res.json(bloodRequests);
    }
    catch (error) {
        console.error('Error fetching blood requests:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getAllBloodRequests = getAllBloodRequests;
//# sourceMappingURL=bloodDonationController.js.map