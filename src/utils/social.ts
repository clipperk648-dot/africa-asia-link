import { getCurrentUser } from "@/utils/mockAuth";
import type { SocialPost as LegacyPost } from "@/utils/mockData";
import { mockSocialPosts } from "@/utils/mockData";

export type SocialPostType = "text" | "image" | "video";
export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  role?: string;
  type: SocialPostType;
  content?: string; // text content
  mediaUrl?: string; // image/video base64 or URL
  likes: number;
  comments: number;
  timestamp: string; // ISO
}

const STORAGE_KEY = "social:posts";

export const getStoredPosts = (): SocialPost[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SocialPost[]) : [];
  } catch {
    return [];
  }
};

export const saveStoredPosts = (posts: SocialPost[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

// Merge legacy mock posts as image-type posts so all roles can see them
const mapLegacy = (p: LegacyPost): SocialPost => ({
  id: `mock-${p.id}`,
  userId: "mock",
  username: p.username,
  avatar: p.avatar,
  role: "mixed",
  type: "image",
  mediaUrl: p.image,
  content: p.caption,
  likes: p.likes,
  comments: p.comments,
  timestamp: new Date().toISOString(),
});

export const getAllPosts = (): SocialPost[] => {
  const legacy = mockSocialPosts.map(mapLegacy);
  const stored = getStoredPosts();
  // Sort newest first
  return [...stored, ...legacy].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const createPost = async (data: { type: SocialPostType; content?: string; mediaUrl?: string; }): Promise<SocialPost> => {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const post: SocialPost = {
    id: crypto.randomUUID(),
    userId: user.id,
    username: user.name || user.email || "user",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.id)}`,
    role: user.role,
    type: data.type,
    content: data.content?.trim() || undefined,
    mediaUrl: data.mediaUrl,
    likes: 0,
    comments: 0,
    timestamp: new Date().toISOString(),
  };
  const posts = getStoredPosts();
  posts.unshift(post);
  saveStoredPosts(posts);
  return post;
};
