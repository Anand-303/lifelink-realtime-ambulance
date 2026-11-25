import express from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  registerForCampaign,
  unregisterFromCampaign,
} from '../controllers/campaignController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getCampaigns)
  .post(protect, admin, createCampaign);

router.route('/:id')
  .get(getCampaignById)
  .put(protect, admin, updateCampaign)
  .delete(protect, admin, deleteCampaign);

router.route('/:id/register')
  .post(protect, registerForCampaign)
  .delete(protect, unregisterFromCampaign);

export default router;