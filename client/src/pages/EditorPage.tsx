import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { PostStatus } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Save, Eye, Edit3, Image, Tag, FileText, CheckCircle2 } from 'lucide-react';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<PostStatus>('published');

  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        // We can fetch user posts or list to find post by id
        const res = await postService.getPosts({ status: 'all', limit: 100 });
        if (res.success) {
          const target = res.data.posts.find((p) => p.id === id || (p as any)._id === id);
          if (target) {
            setTitle(target.title);
            setExcerpt(target.excerpt);
            setContent(target.content);
            setCoverImageUrl(target.coverImageUrl || '');
            setTags(target.tags || []);
            setStatus(target.status);
          } else {
            setError('Post not found or you do not have edit permission.');
          }
        }
      } catch (err) {
        console.error('Failed to load post for editing', err);
        setError('Failed to load post data');
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [id]);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const formatted = tagInput.trim().replace(/^#/, '');
    if (formatted && !tags.includes(formatted)) {
      setTags([...tags, formatted]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      setError('Please fill in Title, Excerpt, and Content.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const postData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImageUrl: coverImageUrl.trim() || undefined,
        tags,
        status,
      };

      if (isEditing && id) {
        const res = await postService.updatePost(id, postData);
        if (res.success) {
          navigate(`/posts/${res.data.post.slug}`);
        }
      } else {
        const res = await postService.createPost(postData);
        if (res.success) {
          navigate(`/posts/${res.data.post.slug}`);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save post.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-slate-400">
        Loading post editor...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Post' : 'Create New Article'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Toggle Switch */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                status === 'published'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Publish
            </button>
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                status === 'draft'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Draft
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : status === 'draft' ? 'Save Draft' : 'Publish Article'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Editor Form Metadata Inputs */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title & Excerpt */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Article Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Master React 19 Compiler and Server Actions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-lg font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Short Excerpt / Summary <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Brief 1-2 sentence overview for feed cards..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                required
              />
            </div>
          </div>

          {/* Cover Image & Tags */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <Image className="w-3.5 h-3.5 text-indigo-400" /> Cover Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Article Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type tag & press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">Markdown Editor</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                activeTab === 'write' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden sm:flex px-3 py-1.5 rounded-lg items-center gap-1 transition-all ${
                activeTab === 'split' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>

        {/* Editor & Live Preview Area */}
        <div className={`grid gap-6 ${activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Write Textarea */}
          {(activeTab === 'write' || activeTab === 'split') && (
            <div className="space-y-2">
              <textarea
                rows={18}
                placeholder="# Write your article using Markdown format..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
                required
              />
            </div>
          )}

          {/* Live Preview */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div className="space-y-2">
              <div className="min-h-[440px] max-h-[600px] overflow-y-auto glass-panel rounded-2xl p-6 border border-slate-800">
                {content.trim() ? (
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 text-sm py-20">
                    Live Markdown preview will appear here as you write...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
