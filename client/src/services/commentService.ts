import { api } from './api';
import { ApiResponse, Comment } from '../types';

export const commentService = {
  getCommentsByPost: async (postIdOrSlug: string) => {
    const res = await api.get<ApiResponse<{ comments: Comment[]; totalCount: number }>>(
      `/posts/${postIdOrSlug}/comments`
    );
    return res.data;
  },

  createComment: async (
    postIdOrSlug: string,
    content: string,
    parentCommentId?: string | null
  ) => {
    const res = await api.post<ApiResponse<{ comment: Comment }>>(
      `/posts/${postIdOrSlug}/comments`,
      {
        content,
        parentCommentId,
      }
    );
    return res.data;
  },

  updateComment: async (id: string, content: string) => {
    const res = await api.put<ApiResponse<{ comment: Comment }>>(`/comments/${id}`, {
      content,
    });
    return res.data;
  },

  deleteComment: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/comments/${id}`);
    return res.data;
  },
};
