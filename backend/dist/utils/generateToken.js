"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generate a JWT token for authentication
 * @param id User ID to include in the token
 * @returns JWT token string
 */
const generateToken = (id) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({ id }, jwtSecret, {
        expiresIn: '30d', // Token expires in 30 days
    });
};
exports.default = generateToken;
//# sourceMappingURL=generateToken.js.map