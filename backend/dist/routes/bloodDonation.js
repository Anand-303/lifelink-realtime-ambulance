"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bloodDonationController_1 = require("../controllers/bloodDonationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Donor routes
router.route('/register-donor')
    .put(auth_1.protect, bloodDonationController_1.registerAsDonor);
router.route('/donors')
    .get(auth_1.protect, bloodDonationController_1.getDonors);
// Blood donation routes
router.route('/')
    .post(auth_1.protect, bloodDonationController_1.recordBloodDonation);
router.route('/inventory')
    .get(auth_1.protect, bloodDonationController_1.getBloodInventory);
// Blood request routes
router.route('/request')
    .post(auth_1.protect, bloodDonationController_1.requestBlood);
router.route('/request/user')
    .get(auth_1.protect, bloodDonationController_1.getUserBloodRequests);
router.route('/request/all')
    .get(auth_1.protect, auth_1.admin, bloodDonationController_1.getAllBloodRequests);
router.route('/request/:id')
    .get(auth_1.protect, bloodDonationController_1.getBloodRequestById);
router.route('/request/:id/status')
    .put(auth_1.protect, auth_1.admin, bloodDonationController_1.updateBloodRequestStatus);
exports.default = router;
//# sourceMappingURL=bloodDonation.js.map