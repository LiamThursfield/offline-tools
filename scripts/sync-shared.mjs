#!/usr/bin/env node
/* Copies the snippets in shared/ into every page, so each page stays a single self-contained file.
   A page opts in to a snippet with a marker pair; everything between the markers is replaced:
     CSS:  /* shared:chrome.css *\/ … /* /shared:chrome.css *\/
     HTML: <!-- shared:footer.html --> … <!-- /shared:footer.html -->
   Usage: node scripts/sync-shared.mjs [--check]   (--check: exit 1 if any page is out of date) */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const snippets = Object.fromEntries(readdirSync(join(root, 'shared')).map(f => [f, readFileSync(join(root, 'shared', f), 'utf8').trim()]));

const pages = ['index.html', ...readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && !['shared', 'scripts', 'node_modules'].includes(d.name))
  .map(d => join(d.name, `${d.name}.html`))
  .filter(p => existsSync(join(root, p)))];

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const markers = [
  [n => `/* shared:${n} */`, n => `/* /shared:${n} */`],
  [n => `<!-- shared:${n} -->`, n => `<!-- /shared:${n} -->`],
];

let stale = 0;
for (const page of pages) {
  const file = join(root, page);
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const [name, body] of Object.entries(snippets)) {
    for (const [open, close] of markers) {
      // Keep the opening marker's indentation for every line of the snippet.
      const re = new RegExp(`([ \\t]*)(${esc(open(name))})[\\s\\S]*?(${esc(close(name))})`, 'g');
      after = after.replace(re, (_, ind, o, c) => `${ind}${o}\n${body.replace(/^/gm, ind)}\n${ind}${c}`);
    }
  }
  if (after !== before) {
    stale++;
    if (check) console.log(`out of date: ${page}`);
    else { writeFileSync(file, after); console.log(`updated: ${page}`); }
  }
}
if (check && stale) { console.log('Run: node scripts/sync-shared.mjs'); process.exit(1); }
if (!stale) console.log('All pages up to date.');
