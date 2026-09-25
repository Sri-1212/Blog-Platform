"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const ApiError_1 = require("./utils/ApiError");
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: [env_1.config.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// API v1 routes
app.use('/api/v1', routes_1.default);
// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Handle 404 routes
app.use((_req, _res, next) => {
    next(ApiError_1.ApiError.notFound('Route not found'));
});
// Centralized error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
