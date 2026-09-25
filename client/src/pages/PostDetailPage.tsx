import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Post } from '../types';
import { postService } from '../services/postService';
import { useAuthStore } from '../store/useAuthStore';
import { SkeletonDetail } from '../components/SkeletonDetail';
import { CommentSection } from '../components/CommentSection';
import { TagChip } from '../components/TagChip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, Edit3, Trash2, Lock, Share2, Check } from 'lucide-react';

export const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await postService.getPostBySlug(slug);
        if (res.success) {
          setPost(res.data.post);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleDeletePost = async () => {
    if (!post || !window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      setDeleting(true);
      await postService.deletePost(post.id);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete post', err);
      setDeleting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <SkeletonDetail />;

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Post Not Found</h2>
        <p className="text-slate-400">{error || 'The requested article does not exist or has been removed.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  const isAuthor = user && (user.id === post.author.id || (post.author as any)._id === user.id);
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>

          {isAuthor && (
            <>
              <Link
                to={`/editor/${post.id}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Post
              </Link>
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 rounded-xl transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Draft Warning Badge */}
      {post.status === 'draft' && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>This post is currently saved as a <strong>Draft</strong> and is only visible to you.</span>
        </div>
      )}

      {/* Header Info */}
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-800/80">
          <div className="flex items-center gap-3">
            <img
              src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`}
              alt={post.author?.name}
              className="w-10 h-10 rounded-full border border-indigo-500/40 object-cover bg-slate-800"
            />
            <div>
              <p className="text-sm font-semibold text-slate-100">{post.author?.name}</p>
              <p className="text-xs text-slate-400">{post.author?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              {readTime} min read
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[450px]">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Markdown Content Body */}
      <div className="markdown-body glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      {/* Comment Section */}
      <CommentSection postId={post.id} />
    </div>
  );
};
