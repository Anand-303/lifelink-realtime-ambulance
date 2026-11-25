import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BloodInventory from '../models/BloodInventory';
import { IUser } from '../models/User';

// Constants
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
type BloodGroup = typeof BLOOD_GROUPS[number];

interface IInventoryResponse {
  bloodGroup: string;
  units: number;
  lastUpdated: Date;
  updatedBy: {
    _id: mongoose.Types.ObjectId | null;
    name: string;
    email?: string;
  };
}

// Helper function to validate blood group
const isValidBloodGroup = (group: string): group is BloodGroup => {
  return BLOOD_GROUPS.includes(group as BloodGroup);
};

/**
 * @route   GET /api/blood-inventory
 * @desc    Get all blood inventory with all blood groups represented
 * @access  Private/Admin
 */
export const getBloodInventory = async (req: Request, res: Response) => {
  try {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get all existing inventory items
      const inventory = await BloodInventory.find()
        .sort('bloodGroup')
        .populate('updatedBy', 'name email')
        .session(session);
      
      // Create a map for quick lookup
      const inventoryMap = new Map<string, IInventoryResponse>();
      
      // Process existing inventory
      inventory.forEach(item => {
        inventoryMap.set(item.bloodGroup, {
          bloodGroup: item.bloodGroup,
          units: item.units,
          lastUpdated: item.lastUpdated,
          updatedBy: item.updatedBy ? {
            _id: item.updatedBy._id,
            name: (item.updatedBy as IUser).name || 'Unknown',
            email: (item.updatedBy as IUser).email
          } : { _id: null, name: 'System' }
        });
      });
      
      // Ensure all blood groups are represented
      const completeInventory = BLOOD_GROUPS.map(group => {
        const existing = inventoryMap.get(group);
        if (existing) return existing;
        
        // Create default entry for missing blood groups
        return {
          bloodGroup: group,
          units: 0,
          lastUpdated: new Date(),
          updatedBy: { _id: null, name: 'System' }
        };
      });
      
      await session.commitTransaction();
      res.json(completeInventory);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error in getBloodInventory:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blood inventory',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

/**
 * @route   PUT /api/blood-inventory/:bloodGroup
 * @desc    Update blood inventory for a specific blood group
 * @access  Private/Admin
 */
export const updateBloodInventory = async (req: Request, res: Response) => {
  // Decode the blood group parameter (handles URL encoding like A+ -> A%2B)
  const bloodGroupParam = req.params.bloodGroup;
  console.log('Blood inventory update request:', { bloodGroupParam, body: req.body});

  if (!bloodGroupParam) {
    return res.status(400).json({
      success: false,
      message: 'Blood group parameter is required'
    });
  }
  const bloodGroup = decodeURIComponent(bloodGroupParam);
  const { units } = req.body;
  const user = req.user as IUser;

  console.log('Decoded blood group:', bloodGroup);
  console.log('user:', user );

  // Check if user is authenticated
  if (!user || !user._id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  // Input validation
  if (!bloodGroup || !isValidBloodGroup(bloodGroup)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid blood group. Must be one of: ' + BLOOD_GROUPS.join(', ')
    });
  }

  // Convert units to number if it's a string
  const unitsNum = typeof units === 'string' ? parseInt(units, 10) : units;
  
  if (typeof unitsNum !== 'number' || isNaN(unitsNum) || !Number.isInteger(unitsNum) || unitsNum < 0) {
    return res.status(400).json({
      success: false,
      message: 'Units must be a non-negative integer'
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const options = { 
      new: true, 
      upsert: true, 
      session,
      setDefaultsOnInsert: true 
    };

    const updatedInventory = await BloodInventory.findOneAndUpdate(
      { bloodGroup },
      { 
        $set: { 
          units: Math.max(0, unitsNum), // Ensure non-negative
          lastUpdated: new Date(),
          updatedBy: user._id
        }
      },
      options
    ).populate('updatedBy', 'name email');

    if (!updatedInventory) {
      throw new Error('Failed to update blood inventory');
    }

    await session.commitTransaction();
    
    res.json({
      success: true,
      data: {
        bloodGroup: updatedInventory.bloodGroup,
        units: updatedInventory.units,
        lastUpdated: updatedInventory.lastUpdated,
        updatedBy: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      },
      message: 'Blood inventory updated successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in updateBloodInventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blood inventory',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  } finally {
    session.endSession();
  }
};

/**
 * @route   DELETE /api/blood-inventory/:bloodGroup
 * @desc    Delete blood inventory (set units to 0)
 * @access  Private/Admin
 */
export const deleteBloodInventory = async (req: Request, res: Response) => {
  // Decode the blood group parameter (handles URL encoding like A+ -> A%2B)
  const bloodGroupParam = req.params.bloodGroup;
  if (!bloodGroupParam) {
    return res.status(400).json({
      success: false,
      message: 'Blood group parameter is required'
    });
  }
  const bloodGroup = decodeURIComponent(bloodGroupParam);
  const user = req.user as IUser;

  if (!bloodGroup || !isValidBloodGroup(bloodGroup)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid blood group. Must be one of: ' + BLOOD_GROUPS.join(', ')
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await BloodInventory.findOneAndUpdate(
      { bloodGroup },
      { 
        $set: { 
          units: 0,
          lastUpdated: new Date(),
          updatedBy: user._id
        }
      },
      { new: true, session }
    ).populate('updatedBy', 'name email');

    if (!result) {
      // If not found, create a zeroed entry
      await new BloodInventory({
        bloodGroup,
        units: 0,
        updatedBy: user._id
      }).save({ session });
    }

    await session.commitTransaction();
    
    res.json({
      success: true,
      message: `Blood group ${bloodGroup} inventory has been cleared`
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in deleteBloodInventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear blood inventory',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  } finally {
    session.endSession();
  }
};

/**
 * @route   POST /api/blood-inventory/initialize
 * @desc    Initialize all blood groups with zero units
 * @access  Private/Admin
 */
export const initializeBloodInventory = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete all existing inventory
    await BloodInventory.deleteMany({}, { session });
    
    // Create zeroed inventory for all blood groups
    const initializedInventory = await BloodInventory.insertMany(
      BLOOD_GROUPS.map(bloodGroup => ({
        bloodGroup,
        units: 0,
        updatedBy: user._id
      })),
      { session }
    );

    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      message: 'Blood inventory initialized successfully',
      data: initializedInventory
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error initializing blood inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize blood inventory',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  } finally {
    session.endSession();
  }
};
