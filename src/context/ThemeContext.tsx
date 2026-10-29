import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Theme = 'daybreak' | 'nightops';
export type ThemePreference = 'daybreak' | 'nightops' | 'system';

interface ThemeContextValue {
  theme: Theme;
  isNightOps: boolean;
  preference: ThemePreference;
  hasCustomPreference: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setPreference: (pref: ThemePreference) => void;
  resetToSystemPreference: () => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'scoutspark_theme_preference';
const LEGACY_STORAGE_KEY = 'scoutspark_theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'nightops' : 'daybreak';
  }
  return 'daybreak';
}

function getInitialPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'daybreak';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved === 'daybreak' || saved === 'nightops' || saved === 'system') {
      return saved as ThemePreference;
    }
  } catch {
    // ignore localStorage errors
  }
  // Default is light mode (daybreak)
  return 'daybreak';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  // Compute resolved active theme: default is light mode (daybreak)
  const theme: Theme = preference === 'system' ? systemTheme : preference;
  const isNightOps = theme === 'nightops';
  const hasCustomPreference = preference !== 'daybreak';

  // Apply classes and attributes to <html>
  const applyThemeToDOM = useCallback((activeTheme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (activeTheme === 'nightops') {
      root.classList.add('nightops', 'dark');
      root.classList.remove('daybreak');
      root.setAttribute('data-theme', 'nightops');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('nightops', 'dark');
      root.classList.add('daybreak');
      root.setAttribute('data-theme', 'daybreak');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Update DOM whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  // Listen to OS system preference changes only if user explicitly chose 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'nightops' : 'daybreak');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Set explicit preference & save to storage
  const setPreference = useCallback((newPref: ThemePreference) => {
    setPreferenceState(newPref);
    try {
      localStorage.setItem(STORAGE_KEY, newPref);
      localStorage.setItem(LEGACY_STORAGE_KEY, newPref);
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setPreference(newTheme);
  }, [setPreference]);

  const toggleTheme = useCallback(() => {
    setTheme(isNightOps ? 'daybreak' : 'nightops');
  }, [isNightOps, setTheme]);

  const resetToSystemPreference = useCallback(() => {
    setPreference('system');
  }, [setPreference]);

  const resetToDefault = useCallback(() => {
    setPreference('daybreak');
  }, [setPreference]);

  // Global Alt+T keyboard shortcut to toggle theme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target && 
        (target.tagName === 'INPUT' || 
         target.tagName === 'TEXTAREA' || 
         target.isContentEditable)
      ) {
        return;
      }

      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isNightOps,
        preference,
        hasCustomPreference,
        toggleTheme,
        setTheme,
        setPreference,
        resetToSystemPreference,
        resetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
