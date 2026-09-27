/* Theme registry. Each id (except "auto") needs a matching :root[data-theme="…"] block in shared/themes.css.
   "auto" follows the OS light/dark setting using the two ids named below.
   A theme based on someone else's work sets `credit`: the footer then names it, linking to `url` if given. */
const THEMES = [
  { id: 'auto', label: 'Auto', light: 'lxst-light', dark: 'lxst-dark' },
  { id: 'lxst-dark', label: 'LXST dark' },
  { id: 'lxst-light', label: 'LXST light' },
  { id: 'classic-dark', label: 'Classic dark' },
  { id: 'classic-light', label: 'Classic light' },
  { id: 'lock-wood', label: 'lock-wood', credit: { name: 'lock-wood colour scheme', url: 'https://github.com/lock-wood/lock-wood-theme' } },
];
/* One key for every page, so the choice carries between tools. */
const THEME_KEY = 'tools.theme';
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
function savedTheme() { try { const t = localStorage.getItem(THEME_KEY); return THEMES.some(x => x.id === t) ? t : 'auto'; } catch { return 'auto'; } }
function applyTheme(id) {
  const t = THEMES.find(x => x.id === id) || THEMES[0];
  const shown = THEMES.find(x => x.id === (t.id === 'auto' ? (darkMQ.matches ? t.dark : t.light) : t.id));
  document.documentElement.dataset.theme = shown.id;
  const sel = document.getElementById('theme');
  if (sel) sel.value = t.id;
  showThemeCredit(shown);
  return t.id;
}
/* Footer note for a theme based on someone else's work (element is in shared/footer.html). */
function showThemeCredit(t) {
  const el = document.getElementById('themeCredit');
  if (!el) return;
  el.hidden = !t.credit;
  if (!t.credit) return;
  const name = t.credit.url ? Object.assign(document.createElement('a'), { href: t.credit.url, textContent: t.credit.name }) : t.credit.name;
  el.replaceChildren(`The ${t.label} theme is based on the `, name, `. It's credited here with thanks; its authors aren't affiliated with these tools.`);
}
function saveTheme(id) { id = applyTheme(id); try { localStorage.setItem(THEME_KEY, id); } catch {} }
applyTheme(savedTheme());
darkMQ.addEventListener('change', () => { if (savedTheme() === 'auto') applyTheme('auto'); });
/* Follow changes made in other tabs, and in other tools when coming back through the history
   (pageshow also runs after the browser restores the picker's old value on back/forward). */
addEventListener('storage', e => { if (e.key === THEME_KEY) applyTheme(savedTheme()); });
addEventListener('pageshow', () => applyTheme(savedTheme()));
