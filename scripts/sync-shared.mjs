#!/usr/bin/env node
/* Copies the shared snippets into every page, so each page stays a single self-contained file.
   A page opts in to a snippet with a marker pair; everything between the markers is replaced:
     CSS:  /* shared:chrome.css *\/ … /* /shared:chrome.css *\/
     HTML: <!-- shared:footer.html --> … <!-- /shared:footer.html -->
   Snippets are the files in shared/ (by file name) plus the ones generated below from shared/tools.json.
   Usage: node scripts/sync-shared.mjs [--check]   (--check: exit 1 if any page is out of date) */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const read = p => readFileSync(join(root, p), 'utf8');

const tools = JSON.parse(read('shared/tools.json'));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const mark = t => `<b>${esc(t.mark[0])}</b>${esc(t.mark[1])}`;

/* Generated snippets: (page) => text. page.slug is the tool's slug, or null for the root pages. */
const generated = {
  // Back link, logo and tool switcher for a tool's header.
  brand: page => {
    const self = tools.find(t => t.slug === page.slug);
    if (!self) throw new Error(`${page.path}: not listed in shared/tools.json`);
    const items = tools.map(t =>
      `    <a href="../${t.slug}/${t.slug}.html" data-path="/${t.slug}"${t === self ? ' aria-current="page"' : ''}><span class="tm-mark">${mark(t)}</span><span class="tm-text"><span class="tm-name">${esc(t.name)}</span><span class="tm-sum">${esc(t.summary)}</span></span></a>`);
    return [
      `<span class="brand">`,
      `  <a class="home" href="../index.html" data-path="/" aria-label="All tools" title="All tools"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></a>`,
      `  <button type="button" class="logo logo-btn" id="toolMenuBtn" aria-expanded="false" aria-controls="toolMenu" title="Switch tool">${mark(self)}<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>`,
      `  <nav class="tool-menu" id="toolMenu" aria-label="Tools" hidden>`,
      ...items,
      `    <a class="tm-all" href="../index.html" data-path="/">All tools</a>`,
      `  </nav>`,
      `</span>`,
    ].join('\n');
  },
  // Cards on the index page.
  'tool-cards': () => tools.map(t => [
    `<li class="tool">`,
    `  <span class="mark" aria-hidden="true">${mark(t)}</span>`,
    `  <h2><a href="${t.slug}/${t.slug}.html" data-path="/${t.slug}">${esc(t.name)}</a></h2>`,
    `  <p>${esc(t.description)}</p>`,
    `  <span class="go" aria-hidden="true">Open →</span>`,
    `</li>`,
  ].join('\n')).join('\n'),
  // Table in the root README.
  'tool-table': () => ['| Tool | What it does |', '| --- | --- |',
    ...tools.map(t => `| [${t.name}](${t.slug}/) | ${t.description} |`)].join('\n'),
};

const files = Object.fromEntries(readdirSync(join(root, 'shared'))
  .filter(f => f !== 'tools.json')
  .map(f => [f, () => read(join('shared', f)).trim()]));
const snippets = { ...files, ...generated };

const pages = [
  { path: 'index.html', slug: null },
  { path: 'README.md', slug: null },
  ...tools.map(t => ({ path: join(t.slug, `${t.slug}.html`), slug: t.slug })),
];

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const markers = [
  [n => `/* shared:${n} */`, n => `/* /shared:${n} */`],
  [n => `<!-- shared:${n} -->`, n => `<!-- /shared:${n} -->`],
];

let stale = 0;
for (const page of pages) {
  const file = join(root, page.path);
  if (!existsSync(file)) throw new Error(`${page.path} is listed in shared/tools.json but doesn't exist`);
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const [name, make] of Object.entries(snippets)) {
    for (const [open, close] of markers) {
      // Keep the opening marker's indentation for every line of the snippet.
      const re = new RegExp(`([ \\t]*)(${reEsc(open(name))})[\\s\\S]*?(${reEsc(close(name))})`, 'g');
      after = after.replace(re, (_, ind, o, c) => `${ind}${o}\n${make(page).replace(/^/gm, ind)}\n${ind}${c}`);
    }
  }
  if (after !== before) {
    stale++;
    if (check) console.log(`out of date: ${page.path}`);
    else { writeFileSync(file, after); console.log(`updated: ${page.path}`); }
  }
}
if (check && stale) { console.log('Run: node scripts/sync-shared.mjs'); process.exit(1); }
if (!stale) console.log('All pages up to date.');
