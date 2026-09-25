import { Response } from 'express';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

const findPostByIdOrSlug = async (identifier: string) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const post = await Post.findById(identifier);
    if (post) return post;
  }
  return await Post.findOne({ slug: identifier });
};

export const getCommentsByPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;

  const post = await findPostByIdOrSlug(postId);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const allComments = await Comment.find({ post: post._id })
    .populate('author', 'name email avatarUrl')
    .sort({ createdAt: 1 });

  // Transform flat comments array into nested tree (1 level of replies)
  const commentMap = new Map<string, any>();
  const topLevelComments: any[] = [];

  allComments.forEach((commentDoc) => {
    const commentObj: any = commentDoc.toJSON();
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
      } else {
        topLevelComments.push(commentObj);
      }
    } else {
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

export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User authentication required');
  }

  const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const { content, parentCommentId } = req.body;

  const post = await findPostByIdOrSlug(postId);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  let parentId: mongoose.Types.ObjectId | null = null;
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw ApiError.notFound('Parent comment not found');
    }
    if (parentComment.post.toString() !== post._id.toString()) {
      throw ApiError.badRequest('Parent comment does not belong to this post');
    }
    parentId = parentComment._id;
  }

  const newComment = await Comment.create({
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

export const updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User authentication required');
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { content } = req.body;

  const comment = await Comment.findById(id);
  if (!comment) {
    throw ApiError.notFound('Comment not found');
  }

  if (comment.author.toString() !== req.user.id) {
    throw ApiError.forbidden('You are not authorized to update this comment');
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

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('User authentication required');
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const comment = await Comment.findById(id);
  if (!comment) {
    throw ApiError.notFound('Comment not found');
  }

  if (comment.author.toString() !== req.user.id) {
    throw ApiError.forbidden('You are not authorized to delete this comment');
  }

  // Delete child replies if this is a parent comment
  await Comment.deleteMany({ parentComment: comment._id });

  await comment.deleteOne();

  return res.status(200).json({
    success: true,
    message: 'Comment and replies deleted successfully',
  });
});
