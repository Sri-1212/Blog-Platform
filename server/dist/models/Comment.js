"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    post: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post reference is required'],
        index: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author reference is required'],
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
    },
    parentComment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
        index: true,
    },
}, {
    timestamps: true,
});
CommentSchema.set('toJSON', {
    transform: function (_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
exports.Comment = (0, mongoose_1.model)('Comment', CommentSchema);
