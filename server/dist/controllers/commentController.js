"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.createComment = exports.getCommentsByPost = void 0;
const Comment_1 = require("../models/Comment");
const Post_1 = require("../models/Post");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const findPostByIdOrSlug = async (identifier) => {
    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
        const post = await Post_1.Post.findById(identifier);
        if (post)
            return post;
    }
    return await Post_1.Post.findOne({ slug: identifier });
};
exports.getCommentsByPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const post = await findPostByIdOrSlug(postId);
    if (!post) {
        throw ApiError_1.ApiError.notFound('Post not found');
    }
    const allComments = await Comment_1.Comment.find({ post: post._id })
        .populate('author', 'name email avatarUrl')
        .sort({ createdAt: 1 });
    // Transform flat comments array into nested tree (1 level of replies)
    const commentMap = new Map();
    const topLevelComments = [];
    allComments.forEach((commentDoc) => {
        const commentObj = commentDoc.toJSON();
        commentObj.replies = [];
        commentMap.set(commentObj.id || commentObj._id.toString(), commentObj);
    });
    allComments.forEach((commentDoc) => {
        const commentId = commentDoc._id.toString();
        const commentObj = commentMap.get(commentId);
        if (commentDoc.parentComment) {
            const parentId = commentDoc.parentComment.toString();
            const parentComment = commentMap.get(parentId);
            if (parentComment) {
                parentComment.replies.push(commentObj);
            }
            else {
                topLevelComments.push(commentObj);
            }
        }
        else {
            topLevelComments.push(commentObj);
        }
    });
    return res.status(200).json({
        success: true,
        data: {
            comments: topLevelComments,
            totalCount: allComments.length,
        },
    });
});
exports.createComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('User authentication required');
    }
    const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
    const { content, parentCommentId } = req.body;
    const post = await findPostByIdOrSlug(postId);
    if (!post) {
        throw ApiError_1.ApiError.notFound('Post not found');
    }
    let parentId = null;
    if (parentCommentId) {
        const parentComment = await Comment_1.Comment.findById(parentCommentId);
        if (!parentComment) {
            throw ApiError_1.ApiError.notFound('Parent comment not found');
        }
        if (parentComment.post.toString() !== post._id.toString()) {
            throw ApiError_1.ApiError.badRequest('Parent comment does not belong to this post');
        }
        parentId = parentComment._id;
    }
    const newComment = await Comment_1.Comment.create({
        post: post._id,
        author: req.user.id,
        content,
        parentComment: parentId,
    });
    await newComment.populate('author', 'name email avatarUrl');
    return res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: {
            comment: {
                ...newComment.toJSON(),
                replies: [],
            },
        },
    });
});
exports.updateComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('User authentication required');
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { content } = req.body;
    const comment = await Comment_1.Comment.findById(id);
    if (!comment) {
        throw ApiError_1.ApiError.notFound('Comment not found');
    }
    if (comment.author.toString() !== req.user.id) {
        throw ApiError_1.ApiError.forbidden('You are not authorized to update this comment');
    }
    comment.content = content;
    await comment.save();
    await comment.populate('author', 'name email avatarUrl');
    return res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: { comment },
    });
});
exports.deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw ApiError_1.ApiError.unauthorized('User authentication required');
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comment = await Comment_1.Comment.findById(id);
    if (!comment) {
        throw ApiError_1.ApiError.notFound('Comment not found');
    }
    if (comment.author.toString() !== req.user.id) {
        throw ApiError_1.ApiError.forbidden('You are not authorized to delete this comment');
    }
    // Delete child replies if this is a parent comment
    await Comment_1.Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    return res.status(200).json({
        success: true,
        message: 'Comment and replies deleted successfully',
    });
});
