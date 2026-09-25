"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const commentController_1 = require("../controllers/commentController");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const postValidator_1 = require("../validators/postValidator");
const commentValidator_1 = require("../validators/commentValidator");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Post routes
router.get('/', authMiddleware_1.optionalAuthenticate, postController_1.getPosts);
router.get('/:slug', authMiddleware_1.optionalAuthenticate, postController_1.getPostBySlug);
router.post('/', authMiddleware_1.authenticate, (0, validateMiddleware_1.validateBody)(postValidator_1.createPostSchema), postController_1.createPost);
router.put('/:id', authMiddleware_1.authenticate, (0, validateMiddleware_1.validateBody)(postValidator_1.updatePostSchema), postController_1.updatePost);
router.delete('/:id', authMiddleware_1.authenticate, postController_1.deletePost);
// Comments nested under post routes
router.get('/:postId/comments', commentController_1.getCommentsByPost);
router.post('/:postId/comments', authMiddleware_1.authenticate, (0, validateMiddleware_1.validateBody)(commentValidator_1.createCommentSchema), commentController_1.createComment);
exports.default = router;
