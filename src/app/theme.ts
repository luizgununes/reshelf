const query = window.matchMedia('(prefers-color-scheme: dark)');

function apply() {
  document.documentElement.classList.toggle('dark', query.matches);
  document.documentElement.style.colorScheme = query.matches ? 'dark' : 'light';
}

export function followSystemTheme() {
  apply();
  query.addEventListener('change', apply);
}
