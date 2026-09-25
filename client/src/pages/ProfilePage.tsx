import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { postService } from '../services/postService';
import { Post, PostStatus } from '../types';
import { Link } from 'react-router-dom';
import { PenSquare, Edit3, Trash2, Eye, Calendar, Lock, Globe, FileText, PlusCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [loading, setLoading] = useState(true);

  const fetchUserPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await postService.getPosts({
        author: user.id,
        status: activeTab,
        limit: 100,
      });

      if (res.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Failed to load user posts', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(postId);
      fetchUserPosts();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    const nextStatus: PostStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await postService.updatePost(post.id, { status: nextStatus });
      fetchUserPosts();
    } catch (err) {
      console.error('Failed to toggle post status', err);
    }
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Member';

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* User Header Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-20 h-20 rounded-full border-2 border-indigo-500/50 object-cover bg-slate-800 shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Joined {formattedJoinDate}
            </div>
          </div>
        </div>

        <Link
          to="/editor"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all shrink-0"
        >
          <PenSquare className="w-4 h-4" /> Create New Article
        </Link>
      </div>

      {/* Tabs & Stats */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              All Articles ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'published'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'draft'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/posts/${post.slug}`}
                    className="text-lg font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {post.title}
                  </Link>
                  <p className="text-slate-400 text-xs line-clamp-1">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleStatus(post)}
                    className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                      post.status === 'published'
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400'
                        : 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300 hover:text-emerald-400'
                    }`}
                    title={`Switch to ${post.status === 'published' ? 'Draft' : 'Published'}`}
                  >
                    {post.status === 'published' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  </button>

                  <Link
                    to={`/posts/${post.slug}`}
                    className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
                    title="View Post"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/editor/${post.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-400 bg-slate-900 border border-slate-800 rounded-xl transition-colors"
                    title="Edit Post"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 glass-panel rounded-3xl border border-slate-800/80 space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No posts in this view</h3>
            <p className="text-slate-400 text-sm">
              You haven't created any {activeTab !== 'all' ? activeTab : ''} articles yet.
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Write an Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
