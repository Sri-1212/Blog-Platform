"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                return next(ApiError_1.ApiError.badRequest('Validation Error', formattedErrors));
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
