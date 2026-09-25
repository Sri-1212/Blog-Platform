"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(ApiError_1.ApiError.unauthorized('Access token is missing or invalid format'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
        };
        next();
    }
    catch (err) {
        return next(ApiError_1.ApiError.unauthorized('Invalid or expired access token'));
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            req.user = {
                id: payload.userId,
                email: payload.email,
            };
        }
        catch (err) {
            // Ignore token errors in optional authentication
        }
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
