"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(msg, errors = []) {
        return new ApiError(400, msg, errors);
    }
    static unauthorized(msg = 'Unauthorized access') {
        return new ApiError(401, msg);
    }
    static forbidden(msg = 'Forbidden action') {
        return new ApiError(403, msg);
    }
    static notFound(msg = 'Resource not found') {
        return new ApiError(404, msg);
    }
    static internal(msg = 'Internal server error') {
        return new ApiError(500, msg);
    }
}
exports.ApiError = ApiError;
