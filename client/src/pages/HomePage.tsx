import React, { useState, useEffect, useCallback } from 'react';
import { Post, Pagination as PaginationType } from '../types';
import { postService } from '../services/postService';
import { PostCard } from '../components/PostCard';
import { SkeletonFeed } from '../components/SkeletonFeed';
import { Pagination } from '../components/Pagination';
import { Search, Sparkles, Filter, X, PlusCircle } from 'lucide-react';
import { TagChip } from '../components/TagChip';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Popular tag suggestions
  const tagSuggestions = ['React', 'TypeScript', 'NodeJS', 'MongoDB', 'Security', 'Vite', 'WebDev'];

  const fetchFeedPosts = useCallback(async (page: number, searchQuery: string, tagQuery: string) => {
    try {
      setLoading(true);
      const res = await postService.getPosts({
        page,
        limit: 6,
        search: searchQuery.trim() || undefined,
        tag: tagQuery || undefined,
        status: 'published',
      });

      if (res.success) {
        setPosts(res.data.posts);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load posts feed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedPosts(pagination.page, search, activeTag);
  }, [pagination.page, activeTag, fetchFeedPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchFeedPosts(1, search, activeTag);
  };

  const handleTagClick = (tag: string) => {
    const nextTag = activeTag === tag ? '' : tag;
    setActiveTag(nextTag);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setActiveTag('');
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchFeedPosts(1, '', '');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Modern Engineering Insights
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Explore stories, code, & software architecture.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            A developer platform built with React 19, TypeScript, and MongoDB. Dive into articles on frontend performance, backends, and cloud security.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts by title, excerpt, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-2xl shadow-lg shadow-indigo-600/20 transition-all shrink-0"
          >
            Search
          </button>
        </form>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter by tag:
            </span>
            {tagSuggestions.map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                active={activeTag === tag}
                onClick={() => handleTagClick(tag)}
              />
            ))}
          </div>

          {(activeTag || search) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
        <SkeletonFeed />
      ) : posts.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onTagClick={handleTagClick}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 glass-panel rounded-3xl border border-slate-800/80 space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-500 border border-slate-800">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">No posts found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {search || activeTag
              ? 'Try changing your search terms or clearing tag filters.'
              : 'No published posts yet — write the first one!'}
          </p>
          {isAuthenticated ? (
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-md transition-all mt-2"
            >
              <PlusCircle className="w-4 h-4" /> Create First Post
            </Link>
          ) : (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
