"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const PostSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required'],
        trim: true,
    },
    coverImageUrl: {
        type: String,
        default: '',
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required'],
        index: true,
    },
    tags: {
        type: [String],
        default: [],
        index: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published',
        index: true,
    },
}, {
    timestamps: true,
});
PostSchema.set('toJSON', {
    transform: function (_doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
exports.Post = (0, mongoose_1.model)('Post', PostSchema);
