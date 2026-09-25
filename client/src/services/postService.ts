import { api } from './api';
import { ApiResponse, Pagination, Post, PostStatus } from '../types';

export interface GetPostsParams {
  page?: number;
  limit?: number;
  tag?: string;
  author?: string;
  status?: PostStatus | 'all';
  search?: string;
}

export interface PostListData {
  posts: Post[];
  pagination: Pagination;
}

export const postService = {
  getPosts: async (params: GetPostsParams = {}) => {
    const res = await api.get<ApiResponse<PostListData>>('/posts', { params });
    return res.data;
  },

  getPostBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<{ post: Post }>>(`/posts/${slug}`);
    return res.data;
  },

  createPost: async (postData: {
    title: string;
    content: string;
    excerpt: string;
    coverImageUrl?: string;
    tags?: string[];
    status?: PostStatus;
  }) => {
    const res = await api.post<ApiResponse<{ post: Post }>>('/posts', postData);
    return res.data;
  },

  updatePost: async (
    id: string,
    postData: Partial<{
      title: string;
      content: string;
      excerpt: string;
      coverImageUrl: string;
      tags: string[];
      status: PostStatus;
    }>
  ) => {
    const res = await api.put<ApiResponse<{ post: Post }>>(`/posts/${id}`, postData);
    return res.data;
  },

  deletePost: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/posts/${id}`);
    return res.data;
  },
};
