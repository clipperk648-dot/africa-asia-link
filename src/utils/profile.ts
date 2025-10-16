export type UserPrefs = { language: string; currency: string };

const imgKey = (userId: string) => `profile:image:${userId}`;
const prefsKey = (userId: string) => `profile:prefs:${userId}`;

export const getProfileImage = (userId: string | undefined | null): string | null => {
  if (!userId) return null;
  try {
    return localStorage.getItem(imgKey(userId));
  } catch {
    return null;
  }
};

export const setProfileImage = async (userId: string, file: File): Promise<string> => {
  const dataUrl = await fileToDataURL(file);
  localStorage.setItem(imgKey(userId), dataUrl);
  return dataUrl;
};

const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const getUserPrefs = (userId: string | undefined | null): UserPrefs => {
  if (!userId) return { language: "English", currency: "USD" };
  try {
    const raw = localStorage.getItem(prefsKey(userId));
    return raw ? (JSON.parse(raw) as UserPrefs) : { language: "English", currency: "USD" };
  } catch {
    return { language: "English", currency: "USD" };
  }
};

export const setUserPrefs = (userId: string | undefined | null, prefs: UserPrefs) => {
  if (!userId) return;
  localStorage.setItem(prefsKey(userId), JSON.stringify(prefs));
};
