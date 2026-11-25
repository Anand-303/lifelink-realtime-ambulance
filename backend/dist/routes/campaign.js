"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const campaignController_1 = require("../controllers/campaignController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .get(campaignController_1.getCampaigns)
    .post(auth_1.protect, auth_1.admin, campaignController_1.createCampaign);
router.route('/:id')
    .get(campaignController_1.getCampaignById)
    .put(auth_1.protect, auth_1.admin, campaignController_1.updateCampaign)
    .delete(auth_1.protect, auth_1.admin, campaignController_1.deleteCampaign);
router.route('/:id/register')
    .post(auth_1.protect, campaignController_1.registerForCampaign)
    .delete(auth_1.protect, campaignController_1.unregisterFromCampaign);
exports.default = router;
//# sourceMappingURL=campaign.js.map