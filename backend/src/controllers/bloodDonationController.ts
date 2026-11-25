import { Request, Response } from 'express';
import { Types, FilterQuery } from 'mongoose';
import BloodDonation from '../models/BloodDonation';
import BloodRequest, { IBloodRequest } from '../models/BloodRequest';
import User, { IUser } from '../models/User';

// Use the same Request type extension from middleware/auth.ts
// No need to redeclare - it's already declared in auth.ts

/**
 * Register as a blood donor
 * @route PUT /api/blood-donation/register-donor
 * @access Private
 */
export const registerAsDonor = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id);

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
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get all blood donors
 * @route GET /api/blood-donation/donors
 * @access Private
 */
export const getDonors = async (req: Request, res: Response) => {
  try {
    const { bloodGroup } = req.query;

    const filter: any = { isDonor: true };

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    const donors = await User.find(filter).select('-password');

    res.json(donors);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Record a blood donation
 * @route POST /api/blood-donation
 * @access Private
 */
export const recordBloodDonation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { bloodGroup, quantity, donationDate, hospital } = req.body;

    // Create blood donation record
    const bloodDonation = await BloodDonation.create({
      donor: req.user._id,
      bloodGroup,
      quantity,
      donationDate: donationDate || new Date(),
      hospital,
    });

    // Update user's last donation date
    await User.findByIdAndUpdate(req.user._id, {
      lastDonationDate: donationDate || new Date(),
    });

    res.status(201).json(bloodDonation);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get blood inventory
 * @route GET /api/blood-donation/inventory
 * @access Private
 */
export const getBloodInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await BloodDonation.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Request blood
 * @route POST /api/blood-donation/request
 * @access Private
 */
export const requestBlood = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      patientName,
      patientAge,
      bloodGroup,
      units,
      hospital,
      urgency = 'medium',
      contactNumber,
      reason,
    } = req.body;

    // Validate required fields
    if (!patientName || !patientAge || !bloodGroup || !units || !hospital || !contactNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields: patientName, patientAge, bloodGroup, units, hospital, contactNumber' 
      });
    }

    // Convert user._id to ObjectId if it's a string
    const user = req.user as IUser;
    let requestedById: Types.ObjectId;
    if (user._id instanceof Types.ObjectId) {
      requestedById = user._id;
    } else {
      requestedById = new Types.ObjectId(String(user._id));
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
    const bloodRequestData: Partial<IBloodRequest> = {
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

    const bloodRequest = new BloodRequest(bloodRequestData);
    await bloodRequest.save();

    // Inventory management can be implemented here if needed

    res.status(201).json(bloodRequest);
  } catch (error: any) {
    console.error('Error creating blood request:', error);
    
    // Provide more detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
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

/**
 * Get blood request by ID
 * @route GET /api/blood-donation/request/:id
 * @access Private
 */
export const getBloodRequestById = async (req: Request, res: Response) => {
  try {
    const requestId = req.params?.id;
    if (!requestId || !Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid blood request ID' });
    }

    const bloodRequest = await BloodRequest.findById(requestId)
      .populate('requestedBy', 'name email')
      .populate('processedBy', 'name email')
      .lean()
      .exec();

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    res.json(bloodRequest);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get user's blood requests
 * @route GET /api/blood-donation/request/user
 * @access Private
 */
export const getUserBloodRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = req.user as IUser;
    if (!user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = user._id instanceof Types.ObjectId 
      ? user._id 
      : new Types.ObjectId(String(user._id));

    const bloodRequests = await BloodRequest.find({ 
      requestedBy: userId 
    })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

    res.json(bloodRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Update blood request status
 * @route PUT /api/blood-donation/request/:id/status
 * @access Private/Admin
 */
export const updateBloodRequestStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const requestId = req.params?.id;
    if (!requestId || !Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid blood request ID' });
    }

    const bloodRequest = await BloodRequest.findById(requestId);

    if (bloodRequest) {
      bloodRequest.status = status;

      // If request is fulfilled, update the blood donation status to used
      if (status === 'fulfilled' && bloodRequest.fulfilledBy) {
        for (const donationId of bloodRequest.fulfilledBy) {
          await BloodDonation.findByIdAndUpdate(donationId, { status: 'used' });
        }
      }

      // If request is cancelled, return the blood to inventory
      if (status === 'cancelled' && bloodRequest.fulfilledBy) {
        for (const donationId of bloodRequest.fulfilledBy) {
          await BloodDonation.findByIdAndUpdate(donationId, { status: 'available' });
        }
        bloodRequest.fulfilledBy = [];
      }

      const updatedRequest = await bloodRequest.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Blood request not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get all blood requests (Admin only)
 * @route GET /api/blood-donation/request/all
 * @access Private/Admin
 */
export const getAllBloodRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    
    if (status) {
      query.status = status;
    }

    const bloodRequests = await BloodRequest.find(query)
      .populate('requestedBy', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(bloodRequests);
  } catch (error: any) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};