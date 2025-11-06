import { getCurrentUser } from "@/utils/mockAuth";

export type ShowroomItem = {
  id: string;
  videoUrl: string;
  title?: string;
  savedAt: string;
};

const keyForUser = (userId: string) => `echina_showroom_${userId}`;

export const getShowroomItems = (userId?: string): ShowroomItem[] => {
  const uid = userId || getCurrentUser()?.id;
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(keyForUser(uid));
    return raw ? (JSON.parse(raw) as ShowroomItem[]) : [];
  } catch {
    return [];
  }
};

export const saveShowroomItem = (videoUrl: string, title?: string, userId?: string) => {
  const uid = userId || getCurrentUser()?.id;
  if (!uid) return;
  const items = getShowroomItems(uid);
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const item: ShowroomItem = { id, videoUrl, title, savedAt: new Date().toISOString() };
  const next = [item, ...items.filter((i) => i.videoUrl !== videoUrl)];
  localStorage.setItem(keyForUser(uid), JSON.stringify(next));
};

export const removeShowroomItem = (id: string, userId?: string) => {
  const uid = userId || getCurrentUser()?.id;
  if (!uid) return;
  const items = getShowroomItems(uid).filter((i) => i.id !== id);
  localStorage.setItem(keyForUser(uid), JSON.stringify(items));
};

export const clearShowroom = (userId?: string) => {
  const uid = userId || getCurrentUser()?.id;
  if (!uid) return;
  localStorage.removeItem(keyForUser(uid));
};
