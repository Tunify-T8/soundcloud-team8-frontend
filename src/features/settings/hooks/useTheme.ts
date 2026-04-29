import { useCallback, useEffect, useState } from "react";
import type { Theme } from "../types/settings.types";

const THEME_STORAGE_KEY = "tunify-theme";
const SC_THEME_STORAGE_KEY = "sc-theme";
const THEMES: Theme[] = ["light", "dark"];

function isTheme(value: string | null): value is Theme {
  return value !== null && THEMES.includes(value as Theme);
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const storedTheme =
    window.localStorage.getItem(SC_THEME_STORAGE_KEY) ??
    window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(storedTheme) ? storedTheme : "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  const setTheme = useCallback((nextTheme: Theme) => {
    window.localStorage.setItem(SC_THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return { theme, setTheme };
}
