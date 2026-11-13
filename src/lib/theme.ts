export type Theme = "day" | "night";

export const THEME_STORAGE_KEY = "trex-theme";
export const DEFAULT_THEME: Theme = "day";

/** Runs in <head> before first paint so a saved night preference never flashes day. */
export const themeInitScript = `(function(){try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="night")document.documentElement.classList.add("dark")}catch(e){}})()`;

export function readTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.classList.contains("dark") ? "night" : "day";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "night");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the toggle still works for this page view.
  }
}
