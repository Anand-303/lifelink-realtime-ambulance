"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Chat endpoint - protected by authentication
router.post('/chat', auth_1.protect, chatController_1.chatHandler);
exports.default = router;
//# sourceMappingURL=chat.js.map