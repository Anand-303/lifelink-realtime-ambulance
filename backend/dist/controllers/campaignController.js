"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterFromCampaign = exports.registerForCampaign = exports.deleteCampaign = exports.updateCampaign = exports.createCampaign = exports.getCampaignById = exports.getCampaigns = void 0;
const Campaign_1 = __importDefault(require("../models/Campaign"));
/**
 * Get all campaigns
 * @route GET /api/campaigns
 * @access Public
 */
const getCampaigns = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const campaigns = await Campaign_1.default.find(filter)
            .populate('organizer', 'name email')
            .sort({ startDate: 1 });
        res.json(campaigns);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getCampaigns = getCampaigns;
/**
 * Get campaign by ID
 * @route GET /api/campaigns/:id
 * @access Public
 */
const getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign_1.default.findById(req.params.id)
            .populate('organizer', 'name email phone')
            .populate('participants', 'name email phone bloodGroup');
        if (campaign) {
            res.json(campaign);
        }
        else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getCampaignById = getCampaignById;
/**
 * Create a new campaign
 * @route POST /api/campaigns
 * @access Private/Admin
 */
const createCampaign = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { title, description, location, startDate, endDate, bloodGroupsNeeded, image, } = req.body;
        const campaign = await Campaign_1.default.create({
            title,
            description,
            organizer: req.user._id,
            location,
            startDate,
            endDate,
            bloodGroupsNeeded,
            image,
        });
        res.status(201).json(campaign);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.createCampaign = createCampaign;
/**
 * Update a campaign
 * @route PUT /api/campaigns/:id
 * @access Private/Admin
 */
const updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign_1.default.findById(req.params.id);
        if (campaign) {
            campaign.title = req.body.title || campaign.title;
            campaign.description = req.body.description || campaign.description;
            campaign.location = req.body.location || campaign.location;
            campaign.startDate = req.body.startDate || campaign.startDate;
            campaign.endDate = req.body.endDate || campaign.endDate;
            campaign.bloodGroupsNeeded = req.body.bloodGroupsNeeded || campaign.bloodGroupsNeeded;
            campaign.image = req.body.image || campaign.image;
            campaign.status = req.body.status || campaign.status;
            const updatedCampaign = await campaign.save();
            res.json(updatedCampaign);
        }
        else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.updateCampaign = updateCampaign;
/**
 * Delete a campaign
 * @route DELETE /api/campaigns/:id
 * @access Private/Admin
 */
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign_1.default.findById(req.params.id);
        if (campaign) {
            await campaign.deleteOne();
            res.json({ message: 'Campaign removed' });
        }
        else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.deleteCampaign = deleteCampaign;
/**
 * Register for a campaign
 * @route POST /api/campaigns/:id/register
 * @access Private
 */
const registerForCampaign = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const campaign = await Campaign_1.default.findById(req.params.id);
        if (campaign) {
            // Check if user is already registered
            if (campaign.participants?.includes(req.user._id)) {
                return res.status(400).json({ message: 'Already registered for this campaign' });
            }
            // Add user to participants
            campaign.participants = [...(campaign.participants || []), req.user._id];
            await campaign.save();
            res.json({ message: 'Successfully registered for campaign' });
        }
        else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.registerForCampaign = registerForCampaign;
/**
 * Unregister from a campaign
 * @route DELETE /api/campaigns/:id/register
 * @access Private
 */
const unregisterFromCampaign = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const campaign = await Campaign_1.default.findById(req.params.id);
        if (campaign) {
            // Remove user from participants
            if (campaign.participants) {
                campaign.participants = campaign.participants.filter((participant) => participant.toString() !== req.user?._id.toString());
            }
            await campaign.save();
            res.json({ message: 'Successfully unregistered from campaign' });
        }
        else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.unregisterFromCampaign = unregisterFromCampaign;
//# sourceMappingURL=campaignController.js.map