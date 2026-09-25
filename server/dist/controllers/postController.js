"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostBySlug = exports.getPosts = void 0;
const Post_1 = require("../models/Post");
const Comment_1 = require("../models/Comment");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const slugify_1 = require("../utils/slugify");
exports.getPosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;
    const { tag, author, status, search } = req.query;
    const filter = {};
    // Visibility logic based on authentication & requested status
    const currentUserId = req.user?.id;
    if (author) {
        filter.author = author;
    }
    if (status) {
        if (status === 'draft') {
            // Only the author can view their drafts
            if (!currentUserId || (author && author !== currentUserId)) {
                filter.status = 'published';
            }
            else {
                filter.status = 'draft';
                filter.author = currentUserId;
            }
        }
        else if (status === 'all') {
            // 'all' allowed only if author filter is the logged in user
            if (currentUserId && author === currentUserId) {
                // no status filter
            }
            else {
                filter.status = 'published';
            }
        }
        else {
            filter.status = status;
        }
    }
    else {
        // Default: return published posts unless author is requesting their own feed without status filter
        if (currentUserId && author === currentUserId) {
            // return all posts for author
        }
        else {
            filter.status = 'published';
        }
    }
    if (tag) {
        filter.tags = tag;
    }
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
            { title: searchRegex },
            { excerpt: searchRegex },
            { tags: searchRegex },
        ];
    }
    const total = await Post_1.Post.countDocuments(filter);
    const posts = await Post_1.Post.find(filter)
        .populate('author', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    return res.status(200).json({
        success: true,
        data: {
            posts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        },
    });
});
exports.getPostBySlug = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const post = await Post_1.Post.findOne({ slug }).populate('author', 'name email avatarUrl');
    if (!post) {
        throw ApiError_1.ApiError.notFound('Post not found');
    }
    if (post.status === 'draft') {
        const currentUserId = req.user?.id;
        const authorId = post.author._id ? post.author._id.toString() : post.author.toString();
        if (currentUserId !== authorId) {
            throw ApiError_1.ApiError.forbidden('This draft post is private to the author');
        }
    }
    return res.status(200).json({
        success: true,
        data: { post },
    });
});
exports.createPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('User authentication required');
    }
    const { title, content, excerpt, coverImageUrl, tags, status } = req.body;
    const slug = await (0, slugify_1.generateUniqueSlug)(title);
    const post = await Post_1.Post.create({
        title,
        slug,
        content,
        excerpt,
        coverImageUrl: coverImageUrl || '',
        tags: tags || [],
        status: status || 'published',
        author: req.user.id,
    });
    await post.populate('author', 'name email avatarUrl');
    return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post },
    });
});
exports.updatePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('User authentication required');
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, content, excerpt, coverImageUrl, tags, status } = req.body;
    const post = await Post_1.Post.findById(id);
    if (!post) {
        throw ApiError_1.ApiError.notFound('Post not found');
    }
    if (post.author.toString() !== req.user.id) {
        throw ApiError_1.ApiError.forbidden('You are not authorized to update this post');
    }
    if (title && title !== post.title) {
        post.title = title;
        post.slug = await (0, slugify_1.generateUniqueSlug)(title, id);
    }
    if (content !== undefined)
        post.content = content;
    if (excerpt !== undefined)
        post.excerpt = excerpt;
    if (coverImageUrl !== undefined)
        post.coverImageUrl = coverImageUrl;
    if (tags !== undefined)
        post.tags = tags;
    if (status !== undefined)
        post.status = status;
    await post.save();
    await post.populate('author', 'name email avatarUrl');
    return res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: { post },
    });
});
exports.deletePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('User authentication required');
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = await Post_1.Post.findById(id);
    if (!post) {
        throw ApiError_1.ApiError.notFound('Post not found');
    }
    if (post.author.toString() !== req.user.id) {
        throw ApiError_1.ApiError.forbidden('You are not authorized to delete this post');
    }
    // Cascade delete comments associated with this post
    await Comment_1.Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    return res.status(200).json({
        success: true,
        message: 'Post and associated comments deleted successfully',
    });
});
