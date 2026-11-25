"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address, bloodGroup, isDonor } = req.body;
        // Check if user already exists
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password,
            phone,
            address,
            bloodGroup,
            isDonor: isDonor || false,
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                bloodGroup: user.bloodGroup,
                isDonor: user.isDonor,
                token: (0, generateToken_1.default)(user._id.toString()),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.registerUser = registerUser;
/**
 * Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Find user by email (case-insensitive)
        const user = await User_1.default.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check if password matches
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Explicitly type the _id as string
        const userId = user._id.toString();
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            phone: user.phone,
            address: user.address,
            bloodGroup: user.bloodGroup,
            isDonor: user.isDonor,
            token: (0, generateToken_1.default)(userId),
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.loginUser = loginUser;
/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = await User_1.default.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
            user.isDonor = req.body.isDonor !== undefined ? req.body.isDonor : user.isDonor;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            // Explicitly type the _id as string
            const updatedUserId = updatedUser._id.toString();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address,
                bloodGroup: updatedUser.bloodGroup,
                isDonor: updatedUser.isDonor,
                token: (0, generateToken_1.default)(updatedUserId),
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=authController.js.map