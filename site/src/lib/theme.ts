import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'catalog-theme';

function readStored(): Theme {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    // storage can be blocked; the default applies
  }
  return 'dark';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readStored);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(KEY, next);
      } catch {
        // ignore: the toggle still works for this session
      }
      return next;
    });
  }, []);
  return [theme, toggle];
}
