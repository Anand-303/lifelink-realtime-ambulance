import express from 'express';
import {
  registerAsDonor,
  getDonors,
  recordBloodDonation,
  getBloodInventory,
  requestBlood,
  getBloodRequestById,
  getUserBloodRequests,
  updateBloodRequestStatus,
  getAllBloodRequests,
} from '../controllers/bloodDonationController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Donor routes
router.route('/register-donor')
  .put(protect, registerAsDonor);

router.route('/donors')
  .get(protect, getDonors);

// Blood donation routes
router.route('/')
  .post(protect, recordBloodDonation);

router.route('/inventory')
  .get(protect, getBloodInventory);

// Blood request routes
router.route('/request')
  .post(protect, requestBlood);

router.route('/request/user')
  .get(protect, getUserBloodRequests);

router.route('/request/all')
  .get(protect, admin, getAllBloodRequests);

router.route('/request/:id')
  .get(protect, getBloodRequestById);

router.route('/request/:id/status')
  .put(protect, admin, updateBloodRequestStatus);

export default router;