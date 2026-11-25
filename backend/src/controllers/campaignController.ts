import { Request, Response } from 'express';
import Campaign from '../models/Campaign';

/**
 * Get all campaigns
 * @route GET /api/campaigns
 * @access Public
 */
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    const campaigns = await Campaign.find(filter)
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });

    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get campaign by ID
 * @route GET /api/campaigns/:id
 * @access Public
 */
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('participants', 'name email phone bloodGroup');

    if (campaign) {
      res.json(campaign);
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Create a new campaign
 * @route POST /api/campaigns
 * @access Private/Admin
 */
export const createCampaign = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      bloodGroupsNeeded,
      image,
    } = req.body;

    const campaign = await Campaign.create({
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
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Update a campaign
 * @route PUT /api/campaigns/:id
 * @access Private/Admin
 */
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

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
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Delete a campaign
 * @route DELETE /api/campaigns/:id
 * @access Private/Admin
 */
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (campaign) {
      await campaign.deleteOne();
      res.json({ message: 'Campaign removed' });
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Register for a campaign
 * @route POST /api/campaigns/:id/register
 * @access Private
 */
export const registerForCampaign = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const campaign = await Campaign.findById(req.params.id);

    if (campaign) {
      // Check if user is already registered
      if (campaign.participants?.includes(req.user._id)) {
        return res.status(400).json({ message: 'Already registered for this campaign' });
      }

      // Add user to participants
      campaign.participants = [...(campaign.participants || []), req.user._id];
      await campaign.save();

      res.json({ message: 'Successfully registered for campaign' });
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Unregister from a campaign
 * @route DELETE /api/campaigns/:id/register
 * @access Private
 */
export const unregisterFromCampaign = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const campaign = await Campaign.findById(req.params.id);

    if (campaign) {
      // Remove user from participants
      if (campaign.participants) {
        campaign.participants = campaign.participants.filter(
          (participant) => participant.toString() !== req.user?._id.toString()
        );
      }
      await campaign.save();

      res.json({ message: 'Successfully unregistered from campaign' });
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};