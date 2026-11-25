"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const bloodInventoryController_1 = require("../controllers/bloodInventoryController");
const router = express_1.default.Router();
// Get all blood inventory (accessible to all authenticated users)
router.get('/', auth_1.protect, bloodInventoryController_1.getBloodInventory);
// Update blood inventory (admin only) - use :bloodGroup parameter
router.put('/:bloodGroup', auth_1.protect, auth_1.admin, bloodInventoryController_1.updateBloodInventory);
// Delete blood inventory (set units to 0, admin only)
router.delete('/:bloodGroup', auth_1.protect, auth_1.admin, bloodInventoryController_1.deleteBloodInventory);
exports.default = router;
//# sourceMappingURL=bloodInventory.js.map