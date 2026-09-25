import { Post } from '../models/Post';

export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (title: string, currentPostId?: string): Promise<string> => {
  const baseSlug = createSlug(title) || 'untitled-post';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Post.findOne({ slug });
    if (!existing || (currentPostId && existing._id.toString() === currentPostId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
