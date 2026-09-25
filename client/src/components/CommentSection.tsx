import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '../types';
import { commentService } from '../services/commentService';
import { useAuthStore } from '../store/useAuthStore';
import { CommentItem } from './CommentItem';
import { MessageSquare, Send, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await commentService.getCommentsByPost(postId);
      if (res.success) {
        setComments(res.data.comments);
        setTotalCount(res.data.totalCount);
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await commentService.createComment(postId, newComment.trim());
      if (res.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-slate-800/80">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">
          Discussion <span className="text-slate-500 font-normal">({totalCount})</span>
        </h3>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-start gap-3">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover bg-slate-800"
            />
            <div className="flex-1 space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts on this article..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 glass-panel p-6 rounded-2xl border border-slate-800/80 text-center space-y-3">
          <p className="text-slate-300 text-sm">Join the discussion! Sign in to leave a comment.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <LogIn className="w-4 h-4" /> Sign In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4 py-4">
          <div className="h-16 bg-slate-800/60 rounded-xl animate-pulse"></div>
          <div className="h-16 bg-slate-800/60 rounded-xl animate-pulse"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={user?.id}
              onRefresh={fetchComments}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          No comments yet. Be the first to start the conversation!
        </div>
      )}
    </section>
  );
};
