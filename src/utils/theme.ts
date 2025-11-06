const THEME_BG_KEY = "echina_theme_bg_video";

// Custom event for theme changes (fires even in same tab)
export const THEME_BG_CHANGED_EVENT = "themeBackgroundChanged";

export const getThemeBgVideoUrl = (): string | null => {
  try {
    return localStorage.getItem(THEME_BG_KEY);
  } catch {
    return null;
  }
};

export const setThemeBgVideoUrl = (url: string) => {
  localStorage.setItem(THEME_BG_KEY, url);
  // Dispatch custom event for immediate updates
  window.dispatchEvent(new CustomEvent(THEME_BG_CHANGED_EVENT, { detail: url }));
};

export const clearThemeBgVideoUrl = () => {
  localStorage.removeItem(THEME_BG_KEY);
  // Dispatch custom event for immediate updates
  window.dispatchEvent(new CustomEvent(THEME_BG_CHANGED_EVENT, { detail: null }));
};
