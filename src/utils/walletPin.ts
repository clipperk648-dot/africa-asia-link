const pinKey = (userId: string) => `wallet:pin:${userId}`;
const unlockedKey = (userId: string) => `wallet:unlocked:${userId}`;

export const getWalletPin = (userId: string | null | undefined): string | null => {
  if (!userId) return null;
  return localStorage.getItem(pinKey(userId));
};

export const setWalletPin = (userId: string, pin: string) => {
  localStorage.setItem(pinKey(userId), pin);
};

export const clearWalletPin = (userId: string) => {
  localStorage.removeItem(pinKey(userId));
  sessionStorage.removeItem(unlockedKey(userId));
};

export const verifyPin = (userId: string, pin: string): boolean => {
  const saved = getWalletPin(userId);
  return !!saved && saved === pin;
};

export const unlockWallet = (userId: string) => {
  sessionStorage.setItem(unlockedKey(userId), "1");
};

export const lockWallet = (userId: string) => {
  sessionStorage.removeItem(unlockedKey(userId));
};

export const isWalletUnlocked = (userId: string | null | undefined): boolean => {
  if (!userId) return false;
  return sessionStorage.getItem(unlockedKey(userId)) === "1";
};
