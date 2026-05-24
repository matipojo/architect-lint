export type Theme = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'architect-lint-theme';

export function getStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'auto';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  return 'auto';
}

export function setStoredTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark');
}

export function cycleTheme(current: Theme): Theme {
  if (current === 'light') return 'dark';
  if (current === 'dark') return 'auto';
  return 'light';
}
