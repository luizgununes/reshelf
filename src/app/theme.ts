export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'reshelf:theme';
const query = window.matchMedia('(prefers-color-scheme: dark)');

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function apply() {
  const preference = readThemePreference();
  const dark = preference === 'dark' || (preference === 'system' && query.matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    return;
  } finally {
    apply();
  }
}

export function followSystemTheme() {
  apply();
  query.addEventListener('change', apply);
}
