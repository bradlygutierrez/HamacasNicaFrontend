"use client";

import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { translateText, type AppLanguage } from "@/app/_lib/localization";
export type { AppLanguage } from "@/app/_lib/localization";
export type AppTheme = "light" | "dark";

const LANGUAGE_STORAGE_KEY = "hamacas:language";
const THEME_STORAGE_KEY = "hamacas:theme";
const PREFERENCES_CHANGE_EVENT = "hamacas:preferences-changed";

type StoredPreferences = {
  language: AppLanguage;
  theme: AppTheme;
};

function readPreferences(): StoredPreferences {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return {
    language: savedLanguage === "en" ? "en" : "es",
    theme: savedTheme === "dark" ? "dark" : "light",
  };
}

function getPreferencesSnapshot() {
  const { language, theme } = readPreferences();
  return `${language}:${theme}`;
}

function getServerPreferencesSnapshot() {
  return "es:light";
}

function subscribeToPreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PREFERENCES_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PREFERENCES_CHANGE_EVENT, onChange);
  };
}

function updateStoredPreferences(update: Partial<StoredPreferences>) {
  const next = { ...readPreferences(), ...update };
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next.language);
  window.localStorage.setItem(THEME_STORAGE_KEY, next.theme);
  window.dispatchEvent(new Event(PREFERENCES_CHANGE_EVENT));
}

type PreferencesContextValue = {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  t: (text: string) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeToPreferences,
    getPreferencesSnapshot,
    getServerPreferencesSnapshot
  );
  const [languageValue, themeValue] = snapshot.split(":");
  const language: AppLanguage = languageValue === "en" ? "en" : "es";
  const theme: AppTheme = themeValue === "dark" ? "dark" : "light";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.preferencesReady = "true";
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [language, theme]);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    updateStoredPreferences({ language: nextLanguage });
  }, []);
  const setTheme = useCallback((nextTheme: AppTheme) => {
    updateStoredPreferences({ theme: nextTheme });
  }, []);
  const t = useCallback((text: string) => translateText(text), []);
  const value = useMemo(
    () => ({ language, theme, setLanguage, setTheme, t }),
    [language, theme, setLanguage, setTheme, t]
  );

  return (
    <PreferencesContext.Provider value={value}>
      <Fragment key={language}>{children}</Fragment>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
