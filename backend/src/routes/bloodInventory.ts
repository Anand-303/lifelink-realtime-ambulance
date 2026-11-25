import express from 'express';
import { protect, admin } from '../middleware/auth';
import { 
  getBloodInventory, 
  updateBloodInventory, 
  deleteBloodInventory 
} from '../controllers/bloodInventoryController';

const router = express.Router();

// Get all blood inventory (accessible to all authenticated users)
router.get('/', protect, getBloodInventory);

// Update blood inventory (admin only) - use :bloodGroup parameter
router.put('/:bloodGroup', protect, admin, updateBloodInventory);

// Delete blood inventory (set units to 0, admin only)
router.delete('/:bloodGroup', protect, admin, deleteBloodInventory);

export default router;
