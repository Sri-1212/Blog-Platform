"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueSlug = exports.createSlug = void 0;
const Post_1 = require("../models/Post");
const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.createSlug = createSlug;
const generateUniqueSlug = async (title, currentPostId) => {
    const baseSlug = (0, exports.createSlug)(title) || 'untitled-post';
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await Post_1.Post.findOne({ slug });
        if (!existing || (currentPostId && existing._id.toString() === currentPostId)) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};
exports.generateUniqueSlug = generateUniqueSlug;
