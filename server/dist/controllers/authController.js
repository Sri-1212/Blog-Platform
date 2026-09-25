"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, avatarUrl } = req.body;
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        throw ApiError_1.ApiError.badRequest('A user with this email already exists');
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const passwordHash = await bcryptjs_1.default.hash(password, salt);
    const defaultAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const user = await User_1.User.create({
        name,
        email,
        passwordHash,
        avatarUrl: defaultAvatar,
    });
    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        },
    });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email }).select('+passwordHash');
    if (!user) {
        throw ApiError_1.ApiError.unauthorized('Invalid email or password');
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        throw ApiError_1.ApiError.unauthorized('Invalid email or password');
    }
    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        },
    });
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw ApiError_1.ApiError.badRequest('Refresh token is required');
    }
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const user = await User_1.User.findById(payload.userId);
        if (!user) {
            throw ApiError_1.ApiError.unauthorized('User not found');
        }
        const newPayload = { userId: user._id.toString(), email: user.email };
        const newAccessToken = (0, jwt_1.signAccessToken)(newPayload);
        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
            },
        });
    }
    catch (err) {
        throw ApiError_1.ApiError.unauthorized('Invalid or expired refresh token');
    }
});
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('User not authenticated');
    }
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    return res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            },
        },
    });
});
