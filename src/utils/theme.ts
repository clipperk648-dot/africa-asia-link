const THEME_BG_KEY = "echina_theme_bg_video";

export const getThemeBgVideoUrl = (): string | null => {
  try {
    return localStorage.getItem(THEME_BG_KEY);
  } catch {
    return null;
  }
};

export const setThemeBgVideoUrl = (url: string) => {
  localStorage.setItem(THEME_BG_KEY, url);
};

export const clearThemeBgVideoUrl = () => {
  localStorage.removeItem(THEME_BG_KEY);
};
