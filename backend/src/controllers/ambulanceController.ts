import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Ambulance from '../models/Ambulance';
import AmbulanceRequest from '../models/AmbulanceRequest';

/**
 * Get all ambulances
 * @route GET /api/ambulance
 * @access Private/Admin
 */
export const getAmbulances = async (req: Request, res: Response) => {
  try {
    const ambulances = await Ambulance.find({});
    res.json(ambulances);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get ambulance by ID
 * @route GET /api/ambulance/:id
 * @access Private
 */
export const getAmbulanceById = async (req: Request, res: Response) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id);

    if (ambulance) {
      res.json(ambulance);
    } else {
      res.status(404).json({ message: 'Ambulance not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Create a new ambulance
 * @route POST /api/ambulance
 * @access Private/Admin
 */
export const createAmbulance = async (req: Request, res: Response) => {
  try {
    const { registrationNumber, driver, location, status } = req.body;

    const ambulanceExists = await Ambulance.findOne({ registrationNumber });

    if (ambulanceExists) {
      return res.status(400).json({ message: 'Ambulance already exists' });
    }

    const ambulance = await Ambulance.create({
      registrationNumber,
      driver,
      location,
      status,
    });

    res.status(201).json(ambulance);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Update ambulance location
 * @route PUT /api/ambulance/:id/location
 * @access Private
 */
export const updateAmbulanceLocation = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    const ambulance = await Ambulance.findById(req.params.id);

    if (ambulance) {
      ambulance.location = {
        latitude,
        longitude,
        updatedAt: new Date(),
      };

      const updatedAmbulance = await ambulance.save();
      res.json(updatedAmbulance);
    } else {
      res.status(404).json({ message: 'Ambulance not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Update ambulance status
 * @route PUT /api/ambulance/:id/status
 * @access Private/Admin
 */
export const updateAmbulanceStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const ambulance = await Ambulance.findById(req.params.id);

    if (ambulance) {
      ambulance.status = status;

      const updatedAmbulance = await ambulance.save();
      res.json(updatedAmbulance);
    } else {
      res.status(404).json({ message: 'Ambulance not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Request an ambulance
 * @route POST /api/ambulance/request
 * @access Private
 */
export const requestAmbulance = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const {
      patientName,
      patientPhone,
      needsBlood,
      urgency,
      pickupLocation,
      destination,
      emergencyDetails,
    } = req.body;

    // Find nearest available ambulance
    const nearestAmbulance = await Ambulance.findOne({ status: 'available' });

    const ambulanceRequest = await AmbulanceRequest.create({
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
      nearestAmbulance.currentRequest = ambulanceRequest._id as any;
      await nearestAmbulance.save();

      // Update request status to accepted
      ambulanceRequest.status = 'accepted';
      await ambulanceRequest.save();
    }

    res.status(201).json(ambulanceRequest);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get ambulance request by ID
 * @route GET /api/ambulance/request/:id
 * @access Private
 */
export const getAmbulanceRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Ambulance request not found' });
    }
    const ambulanceRequest = await AmbulanceRequest.findById(id)
      .populate('user', 'name email phone')
      .populate('ambulance');

    if (ambulanceRequest) {
      res.json(ambulanceRequest);
    } else {
      res.status(404).json({ message: 'Ambulance request not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Update ambulance request status
 * @route PUT /api/ambulance/request/:id/status
 * @access Private
 */
export const updateAmbulanceRequestStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const { id } = req.params as { id?: string };
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Ambulance request not found' });
    }

    const ambulanceRequest = await AmbulanceRequest.findById(id);

    if (ambulanceRequest) {
      ambulanceRequest.status = status;

      // If request is completed or cancelled, free up the ambulance
      if (status === 'completed' || status === 'cancelled') {
        if (ambulanceRequest.ambulance) {
          const ambulance = await Ambulance.findById(ambulanceRequest.ambulance);
          if (ambulance) {
            ambulance.status = 'available';
            ambulance.currentRequest = null as any;
            await ambulance.save();
          }
        }
      }

      const updatedRequest = await ambulanceRequest.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Ambulance request not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get user's ambulance requests
 * @route GET /api/ambulance/request/user
 * @access Private
 */
export const getUserAmbulanceRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const ambulanceRequests = await AmbulanceRequest.find({ user: req.user._id })
      .populate('ambulance')
      .sort({ createdAt: -1 });

    res.json(ambulanceRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Get all ambulance requests (Admin only)
 * @route GET /api/ambulance/request/all
 * @access Private/Admin
 */
export const getAllAmbulanceRequests = async (req: Request, res: Response) => {
  try {
    const ambulanceRequests = await AmbulanceRequest.find({})
      .populate('user', 'name email phone')
      .populate('ambulance')
      .sort({ createdAt: -1 });

    res.json(ambulanceRequests);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Allocate a specific ambulance to a request (Admin)
 * @route PUT /api/ambulance/request/:id/allocate
 * @access Private/Admin
 */
export const allocateAmbulanceToRequest = async (req: Request, res: Response) => {
  try {
    const { ambulanceId } = req.body as { ambulanceId?: string };
    const requestId = req.params.id as string | undefined;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(404).json({ message: 'Ambulance request not found' });
    }
    if (!ambulanceId || !mongoose.Types.ObjectId.isValid(ambulanceId)) {
      return res.status(404).json({ message: 'Ambulance not found' });
    }

    const ambulanceRequest = await AmbulanceRequest.findById(requestId);
    if (!ambulanceRequest) {
      return res.status(404).json({ message: 'Ambulance request not found' });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: 'Ambulance not found' });
    }

    // If request already had an ambulance, free it
    if (ambulanceRequest.ambulance) {
      const prevAmbulance = await Ambulance.findById(ambulanceRequest.ambulance);
      if (prevAmbulance) {
        prevAmbulance.status = 'available';
        prevAmbulance.currentRequest = null as any;
        await prevAmbulance.save();
      }
    }

    // Allocate the selected ambulance
    ambulanceRequest.ambulance = ambulance._id as any;
    if (ambulanceRequest.status === 'pending') {
      ambulanceRequest.status = 'accepted';
    }
    await ambulanceRequest.save();

    ambulance.status = 'busy';
    ambulance.currentRequest = ambulanceRequest._id as any;
    await ambulance.save();

    const populated = await AmbulanceRequest.findById(requestId)
      .populate('user', 'name email phone')
      .populate('ambulance');

    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

/**
 * Delete an ambulance (Admin only)
 * @route DELETE /api/ambulance/:id
 * @access Private/Admin
 */
export const deleteAmbulance = async (req: Request, res: Response) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id);

    if (ambulance) {
      await ambulance.deleteOne();
      res.json({ message: 'Ambulance deleted successfully' });
    } else {
      res.status(404).json({ message: 'Ambulance not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};