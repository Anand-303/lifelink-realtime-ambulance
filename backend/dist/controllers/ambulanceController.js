"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAmbulance = exports.allocateAmbulanceToRequest = exports.getAllAmbulanceRequests = exports.getUserAmbulanceRequests = exports.updateAmbulanceRequestStatus = exports.getAmbulanceRequestById = exports.requestAmbulance = exports.updateAmbulanceStatus = exports.updateAmbulanceLocation = exports.createAmbulance = exports.getAmbulanceById = exports.getAmbulances = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Ambulance_1 = __importDefault(require("../models/Ambulance"));
const AmbulanceRequest_1 = __importDefault(require("../models/AmbulanceRequest"));
/**
 * Get all ambulances
 * @route GET /api/ambulance
 * @access Private/Admin
 */
const getAmbulances = async (req, res) => {
    try {
        const ambulances = await Ambulance_1.default.find({});
        res.json(ambulances);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getAmbulances = getAmbulances;
/**
 * Get ambulance by ID
 * @route GET /api/ambulance/:id
 * @access Private
 */
const getAmbulanceById = async (req, res) => {
    try {
        const ambulance = await Ambulance_1.default.findById(req.params.id);
        if (ambulance) {
            res.json(ambulance);
        }
        else {
            res.status(404).json({ message: 'Ambulance not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getAmbulanceById = getAmbulanceById;
/**
 * Create a new ambulance
 * @route POST /api/ambulance
 * @access Private/Admin
 */
const createAmbulance = async (req, res) => {
    try {
        const { registrationNumber, driver, location, status } = req.body;
        const ambulanceExists = await Ambulance_1.default.findOne({ registrationNumber });
        if (ambulanceExists) {
            return res.status(400).json({ message: 'Ambulance already exists' });
        }
        const ambulance = await Ambulance_1.default.create({
            registrationNumber,
            driver,
            location,
            status,
        });
        res.status(201).json(ambulance);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.createAmbulance = createAmbulance;
/**
 * Update ambulance location
 * @route PUT /api/ambulance/:id/location
 * @access Private
 */
const updateAmbulanceLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const ambulance = await Ambulance_1.default.findById(req.params.id);
        if (ambulance) {
            ambulance.location = {
                latitude,
                longitude,
                updatedAt: new Date(),
            };
            const updatedAmbulance = await ambulance.save();
            res.json(updatedAmbulance);
        }
        else {
            res.status(404).json({ message: 'Ambulance not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.updateAmbulanceLocation = updateAmbulanceLocation;
/**
 * Update ambulance status
 * @route PUT /api/ambulance/:id/status
 * @access Private/Admin
 */
const updateAmbulanceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ambulance = await Ambulance_1.default.findById(req.params.id);
        if (ambulance) {
            ambulance.status = status;
            const updatedAmbulance = await ambulance.save();
            res.json(updatedAmbulance);
        }
        else {
            res.status(404).json({ message: 'Ambulance not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.updateAmbulanceStatus = updateAmbulanceStatus;
/**
 * Request an ambulance
 * @route POST /api/ambulance/request
 * @access Private
 */
const requestAmbulance = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { patientName, patientPhone, needsBlood, urgency, pickupLocation, destination, emergencyDetails, } = req.body;
        // Find nearest available ambulance
        const nearestAmbulance = await Ambulance_1.default.findOne({ status: 'available' });
        const ambulanceRequest = await AmbulanceRequest_1.default.create({
            user: req.user._id,
            patientName,
            patientPhone,
            needsBlood: !!needsBlood,
            urgency: urgency || 'medium',
            pickupLocation,
            destination,
            emergencyDetails,
            status: 'pending',
            ambulance: nearestAmbulance ? nearestAmbulance._id : undefined,
        });
        // If ambulance is found, update its status and current request
        if (nearestAmbulance) {
            nearestAmbulance.status = 'busy';
            nearestAmbulance.currentRequest = ambulanceRequest._id;
            await nearestAmbulance.save();
            // Update request status to accepted
            ambulanceRequest.status = 'accepted';
            await ambulanceRequest.save();
        }
        res.status(201).json(ambulanceRequest);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.requestAmbulance = requestAmbulance;
/**
 * Get ambulance request by ID
 * @route GET /api/ambulance/request/:id
 * @access Private
 */
const getAmbulanceRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Ambulance request not found' });
        }
        const ambulanceRequest = await AmbulanceRequest_1.default.findById(id)
            .populate('user', 'name email phone')
            .populate('ambulance');
        if (ambulanceRequest) {
            res.json(ambulanceRequest);
        }
        else {
            res.status(404).json({ message: 'Ambulance request not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getAmbulanceRequestById = getAmbulanceRequestById;
/**
 * Update ambulance request status
 * @route PUT /api/ambulance/request/:id/status
 * @access Private
 */
const updateAmbulanceRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Ambulance request not found' });
        }
        const ambulanceRequest = await AmbulanceRequest_1.default.findById(id);
        if (ambulanceRequest) {
            ambulanceRequest.status = status;
            // If request is completed or cancelled, free up the ambulance
            if (status === 'completed' || status === 'cancelled') {
                if (ambulanceRequest.ambulance) {
                    const ambulance = await Ambulance_1.default.findById(ambulanceRequest.ambulance);
                    if (ambulance) {
                        ambulance.status = 'available';
                        ambulance.currentRequest = null;
                        await ambulance.save();
                    }
                }
            }
            const updatedRequest = await ambulanceRequest.save();
            res.json(updatedRequest);
        }
        else {
            res.status(404).json({ message: 'Ambulance request not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.updateAmbulanceRequestStatus = updateAmbulanceRequestStatus;
/**
 * Get user's ambulance requests
 * @route GET /api/ambulance/request/user
 * @access Private
 */
const getUserAmbulanceRequests = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const ambulanceRequests = await AmbulanceRequest_1.default.find({ user: req.user._id })
            .populate('ambulance')
            .sort({ createdAt: -1 });
        res.json(ambulanceRequests);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getUserAmbulanceRequests = getUserAmbulanceRequests;
/**
 * Get all ambulance requests (Admin only)
 * @route GET /api/ambulance/request/all
 * @access Private/Admin
 */
const getAllAmbulanceRequests = async (req, res) => {
    try {
        const ambulanceRequests = await AmbulanceRequest_1.default.find({})
            .populate('user', 'name email phone')
            .populate('ambulance')
            .sort({ createdAt: -1 });
        res.json(ambulanceRequests);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getAllAmbulanceRequests = getAllAmbulanceRequests;
/**
 * Allocate a specific ambulance to a request (Admin)
 * @route PUT /api/ambulance/request/:id/allocate
 * @access Private/Admin
 */
const allocateAmbulanceToRequest = async (req, res) => {
    try {
        const { ambulanceId } = req.body;
        const requestId = req.params.id;
        if (!requestId || !mongoose_1.default.Types.ObjectId.isValid(requestId)) {
            return res.status(404).json({ message: 'Ambulance request not found' });
        }
        if (!ambulanceId || !mongoose_1.default.Types.ObjectId.isValid(ambulanceId)) {
            return res.status(404).json({ message: 'Ambulance not found' });
        }
        const ambulanceRequest = await AmbulanceRequest_1.default.findById(requestId);
        if (!ambulanceRequest) {
            return res.status(404).json({ message: 'Ambulance request not found' });
        }
        const ambulance = await Ambulance_1.default.findById(ambulanceId);
        if (!ambulance) {
            return res.status(404).json({ message: 'Ambulance not found' });
        }
        // If request already had an ambulance, free it
        if (ambulanceRequest.ambulance) {
            const prevAmbulance = await Ambulance_1.default.findById(ambulanceRequest.ambulance);
            if (prevAmbulance) {
                prevAmbulance.status = 'available';
                prevAmbulance.currentRequest = null;
                await prevAmbulance.save();
            }
        }
        // Allocate the selected ambulance
        ambulanceRequest.ambulance = ambulance._id;
        if (ambulanceRequest.status === 'pending') {
            ambulanceRequest.status = 'accepted';
        }
        await ambulanceRequest.save();
        ambulance.status = 'busy';
        ambulance.currentRequest = ambulanceRequest._id;
        await ambulance.save();
        const populated = await AmbulanceRequest_1.default.findById(requestId)
            .populate('user', 'name email phone')
            .populate('ambulance');
        res.json(populated);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.allocateAmbulanceToRequest = allocateAmbulanceToRequest;
/**
 * Delete an ambulance (Admin only)
 * @route DELETE /api/ambulance/:id
 * @access Private/Admin
 */
const deleteAmbulance = async (req, res) => {
    try {
        const ambulance = await Ambulance_1.default.findById(req.params.id);
        if (ambulance) {
            await ambulance.deleteOne();
            res.json({ message: 'Ambulance deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'Ambulance not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.deleteAmbulance = deleteAmbulance;
//# sourceMappingURL=ambulanceController.js.map