import type { SocialPost } from "@/utils/mockData";

const PROFILE_KEY = "social_profile_v1";
const USER_POSTS_KEY = "social_user_posts_v1";
const LIKES_KEY = "social_likes_v1";
const SAVED_KEY = "social_saved_v1";
const ACTIVITY_KEY = "social_activity_v1";

export type Profile = { displayName: string; bio: string };

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  addActivity({ type: "profile", message: "Updated profile" });
}

export function getUserPosts(): SocialPost[] {
  try {
    const raw = localStorage.getItem(USER_POSTS_KEY);
    return raw ? (JSON.parse(raw) as SocialPost[]) : [];
  } catch {
    return [];
  }
}

export function addUserPost(post: SocialPost) {
  const posts = getUserPosts();
  posts.unshift(post);
  localStorage.setItem(USER_POSTS_KEY, JSON.stringify(posts));
  addActivity({ type: "post", message: "Created a new post" });
}

export function getLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function setLikedIds(ids: Set<string>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...ids]));
}

export function getSavedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function setSavedIds(ids: Set<string>) {
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
}

export type ActivityItem = { type: "like" | "save" | "post" | "profile"; message: string; ts?: number };

export function getActivity(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as ActivityItem[]) : [];
  } catch {
    return [];
  }
}

export function addActivity(item: ActivityItem) {
  const list = getActivity();
  list.unshift({ ...item, ts: Date.now() });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list));
}
