"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ambulanceController_1 = require("../controllers/ambulanceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Ambulance routes
router.route('/')
    .get(auth_1.protect, auth_1.admin, ambulanceController_1.getAmbulances)
    .post(auth_1.protect, auth_1.admin, ambulanceController_1.createAmbulance);
router.route('/:id')
    .get(auth_1.protect, ambulanceController_1.getAmbulanceById)
    .delete(auth_1.protect, auth_1.admin, ambulanceController_1.deleteAmbulance);
router.route('/:id/location')
    .put(auth_1.protect, ambulanceController_1.updateAmbulanceLocation);
router.route('/:id/status')
    .put(auth_1.protect, auth_1.admin, ambulanceController_1.updateAmbulanceStatus);
// Ambulance request routes
router.route('/request')
    .post(auth_1.protect, ambulanceController_1.requestAmbulance);
router.route('/request/user')
    .get(auth_1.protect, ambulanceController_1.getUserAmbulanceRequests);
router.route('/request/all')
    .get(auth_1.protect, auth_1.admin, ambulanceController_1.getAllAmbulanceRequests);
router.route('/request/:id')
    .get(auth_1.protect, ambulanceController_1.getAmbulanceRequestById);
router.route('/request/:id/status')
    .put(auth_1.protect, ambulanceController_1.updateAmbulanceRequestStatus);
// Allocate a specific ambulance to a request (Admin)
router.route('/request/:id/allocate')
    .put(auth_1.protect, auth_1.admin, (req, res, next) => {
    // Import lazily to avoid circular import concerns in some bundlers
    // but TypeScript will inline from controllers module
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { allocateAmbulanceToRequest } = require('../controllers/ambulanceController');
    return allocateAmbulanceToRequest(req, res, next);
});
exports.default = router;
//# sourceMappingURL=ambulance.js.map