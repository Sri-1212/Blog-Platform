import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { TagChip } from './TagChip';
import { Calendar, Clock, Lock } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onTagClick?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onTagClick }) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Estimate read time (words / 200)
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <article className="group glass-panel rounded-2xl overflow-hidden border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between">
      <div>
        {/* Cover Image */}
        {post.coverImageUrl ? (
          <div className="relative h-48 w-full overflow-hidden bg-slate-900">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {post.status === 'draft' && (
              <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Lock className="w-3 h-3" /> Draft
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-24 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
            {post.status === 'draft' && (
              <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Draft
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Author & Meta */}
          <div className="flex items-center justify-between gap-2 mb-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <img
                src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`}
                alt={post.author?.name}
                className="w-7 h-7 rounded-full border border-indigo-500/30 object-cover bg-slate-800"
              />
              <span className="font-medium text-slate-200">{post.author?.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {readTime} min
              </span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/posts/${post.slug}`}>
            <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2 leading-snug">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="text-slate-300 text-sm line-clamp-3 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Tags Footer */}
      <div className="px-5 pb-5 pt-2 flex flex-wrap gap-1.5 border-t border-slate-800/40">
        {post.tags && post.tags.length > 0 ? (
          post.tags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              onClick={() => onTagClick && onTagClick(tag)}
            />
          ))
        ) : (
          <span className="text-xs text-slate-600">No tags</span>
        )}
      </div>
    </article>
  );
};
