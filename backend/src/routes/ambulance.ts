import express from 'express';
import {
  getAmbulances,
  getAmbulanceById,
  createAmbulance,
  updateAmbulanceLocation,
  updateAmbulanceStatus,
  requestAmbulance,
  getAmbulanceRequestById,
  updateAmbulanceRequestStatus,
  getUserAmbulanceRequests,
  getAllAmbulanceRequests,
  deleteAmbulance,
} from '../controllers/ambulanceController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Ambulance routes
router.route('/')
  .get(protect, admin, getAmbulances)
  .post(protect, admin, createAmbulance);

router.route('/:id')
  .get(protect, getAmbulanceById)
  .delete(protect, admin, deleteAmbulance);

router.route('/:id/location')
  .put(protect, updateAmbulanceLocation);

router.route('/:id/status')
  .put(protect, admin, updateAmbulanceStatus);

// Ambulance request routes
router.route('/request')
  .post(protect, requestAmbulance);

router.route('/request/user')
  .get(protect, getUserAmbulanceRequests);

router.route('/request/all')
  .get(protect, admin, getAllAmbulanceRequests);

router.route('/request/:id')
  .get(protect, getAmbulanceRequestById);

router.route('/request/:id/status')
  .put(protect, updateAmbulanceRequestStatus);

// Allocate a specific ambulance to a request (Admin)
router.route('/request/:id/allocate')
  .put(protect, admin, (req, res, next) => {
    // Import lazily to avoid circular import concerns in some bundlers
    // but TypeScript will inline from controllers module
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { allocateAmbulanceToRequest } = require('../controllers/ambulanceController');
    return allocateAmbulanceToRequest(req, res, next);
  });

export default router;