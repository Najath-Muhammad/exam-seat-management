/**
 * strip-comments.js
 * Removes all single-line (//) and multi-line (/* *\/) comments from
 * .ts / .tsx / .js files, while correctly ignoring comment-like
 * sequences inside string literals and template literals.
 */
const fs   = require('fs');
const path = require('path');

function stripComments(src) {
  let out = '';
  let i   = 0;

  while (i < src.length) {
    const ch   = src[i];
    const next = src[i + 1];

    // ── Template literal ──────────────────────────────────────────────────
    if (ch === '`') {
      out += ch; i++;
      while (i < src.length) {
        const c = src[i];
        out += c; i++;
        if (c === '\\') { out += src[i] ?? ''; i++; continue; }
        if (c === '`') break;
      }
      continue;
    }

    // ── Double-quoted string ───────────────────────────────────────────────
    if (ch === '"') {
      out += ch; i++;
      while (i < src.length) {
        const c = src[i];
        out += c; i++;
        if (c === '\\') { out += src[i] ?? ''; i++; continue; }
        if (c === '"') break;
      }
      continue;
    }

    // ── Single-quoted string ───────────────────────────────────────────────
    if (ch === "'") {
      out += ch; i++;
      while (i < src.length) {
        const c = src[i];
        out += c; i++;
        if (c === '\\') { out += src[i] ?? ''; i++; continue; }
        if (c === "'") break;
      }
      continue;
    }

    // ── Single-line comment  //... ─────────────────────────────────────────
    if (ch === '/' && next === '/') {
      i += 2;
      while (i < src.length && src[i] !== '\n') i++;
      // leave the newline so line numbers are preserved
      continue;
    }

    // ── Multi-line comment  /* ... */ ──────────────────────────────────────
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length) {
        if (src[i] === '*' && src[i + 1] === '/') { i += 2; break; }
        if (src[i] === '\n') out += '\n';   // preserve blank lines
        i++;
      }
      continue;
    }

    out += ch;
    i++;
  }

  // Collapse runs of 3+ blank lines down to 2
  return out.replace(/\n{3,}/g, '\n\n');
}

function walkDir(dir, exts, ignore) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!ignore.includes(e.name)) files = files.concat(walkDir(full, exts, ignore));
    } else if (exts.includes(path.extname(e.name))) {
      files.push(full);
    }
  }
  return files;
}

const roots = [
  path.resolve(__dirname, 'backend/src'),
  path.resolve(__dirname, 'frontend/src'),
];
const EXTS   = ['.ts', '.tsx', '.js'];
const IGNORE = ['node_modules', '.git', 'dist', 'build'];

let changed = 0;
for (const root of roots) {
  for (const file of walkDir(root, EXTS, IGNORE)) {
    const original = fs.readFileSync(file, 'utf8');
    const stripped = stripComments(original);
    if (stripped !== original) {
      fs.writeFileSync(file, stripped, 'utf8');
      console.log('stripped:', path.relative(__dirname, file));
      changed++;
    }
  }
}
console.log(`\nDone — ${changed} file(s) modified.`);
