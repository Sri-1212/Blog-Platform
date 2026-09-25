import React, { useState } from 'react';
import { Comment } from '../types';
import { MessageSquare, Edit2, Trash2, Send, CornerDownRight, X, Check } from 'lucide-react';
import { commentService } from '../services/commentService';
import { useAuthStore } from '../store/useAuthStore';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onRefresh: () => void;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  currentUserId,
  onRefresh,
  isReply = false,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isAuthor = currentUserId && (comment.author.id === currentUserId || (comment.author as any)._id === currentUserId);

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setIsReplying(true);
      await commentService.createComment(postId, replyContent.trim(), comment.id);
      setReplyContent('');
      setShowReplyForm(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to submit reply', err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      setIsSavingEdit(true);
      await commentService.updateComment(comment.id, editContent.trim());
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to edit comment', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      setIsDeleting(true);
      await commentService.deleteComment(comment.id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete comment', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className={`space-y-3 ${isReply ? 'ml-6 sm:ml-10 border-l-2 border-slate-800 pl-4 py-1' : 'border-b border-slate-800/80 pb-6'}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Author Avatar & Info */}
        <div className="flex items-center gap-3">
          <img
            src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name}`}
            alt={comment.author?.name}
            className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover bg-slate-800"
          />
          <div>
            <span className="text-sm font-semibold text-slate-100">{comment.author?.name}</span>
            <span className="text-xs text-slate-500 ml-2">{formattedDate}</span>
          </div>
        </div>

        {/* Action controls for Author */}
        {isAuthor && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
              title="Edit comment"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors disabled:opacity-50"
              title="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Comment Body or Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="mt-2 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingEdit}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </form>
      ) : (
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pl-1">
          {comment.content}
        </p>
      )}

      {/* Reply Toggle */}
      {!isReply && isAuthenticated && !isEditing && (
        <div className="pt-1">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showReplyForm ? <X className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
            {showReplyForm ? 'Cancel Reply' : 'Reply'}
          </button>
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleCreateReply} className="mt-3 flex gap-2">
          <CornerDownRight className="w-4 h-4 text-indigo-400 shrink-0 mt-2" />
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder={`Replying to ${comment.author?.name}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isReplying || !replyContent.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3 h-3" /> Post Reply
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Child Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pt-3 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              onRefresh={onRefresh}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
