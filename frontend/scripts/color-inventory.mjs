/*
 * Inventory every color literal in style.css grouped by
 * property class (text / bg / border / shadow / other).
 *
 * Usage: node scripts/color-inventory.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/style.css"), "utf8");
const lines = css.split("\n");

/* Ranges excluded from tokenization (hand-written or deleted). */
const EXCLUDE = [
  [1, 735], // shell — hand rewritten
  [2519, 3900], // landing / cover — intentionally dark
  [4816, 4898], // DARK LOGIN THEME — deleted
  [5228, 5307], // DARK REGISTER THEME — deleted
];

const inExcluded = (n) =>
  EXCLUDE.some(([a, b]) => n >= a && n <= b);

const classify = (prop) => {
  if (
    prop === "color" ||
    prop === "fill" ||
    prop === "stroke" ||
    prop === "caret-color" ||
    prop === "accent-color" ||
    prop === "-webkit-text-fill-color"
  ) {
    return "text";
  }
  if (
    prop === "background" ||
    prop === "background-color" ||
    prop.startsWith("background")
  ) {
    return "bg";
  }
  if (
    prop === "border" ||
    prop.startsWith("border-") ||
    prop === "outline" ||
    prop.startsWith("outline-") ||
    prop === "column-rule-color"
  ) {
    return prop.includes("color") || prop === "border" || prop === "outline"
      ? "border"
      : "border";
  }
  if (
    prop === "box-shadow" ||
    prop === "text-shadow" ||
    prop === "filter"
  ) {
    return "shadow";
  }
  return "other";
};

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;

const counts = new Map();

/* declaration: line looks like "  prop: value;" (possibly multi-line
   values exist — handle by scanning with a small buffer). */
const declRe = /^\s*([a-z-]+)\s*:\s*(.+?);?\s*$/i;

let lineNo = 0;
let pending = null; // { prop, class, startLine }

const flush = () => {
  if (!pending) return;
  const { cls, value, startLine } = pending;
  let m;
  COLOR_RE.lastIndex = 0;
  while ((m = COLOR_RE.exec(value))) {
    const raw = m[0].toLowerCase();
    if (startLine && inExcluded(startLine)) continue;
    const key = `${cls}|${raw}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  pending = null;
};

for (const line of lines) {
  lineNo++;
  const stripped = line.replace(/\/\*.*?\*\//g, "");
  if (!stripped.trim()) {
    flush();
    continue;
  }

  /* continuation of a multi-line value? */
  if (pending && !/^[a-z-]+\s*:/i.test(stripped.trim())) {
    pending.value += " " + stripped.trim();
    if (stripped.includes(";")) flush();
    continue;
  }

  flush();

  const m = declRe.exec(stripped);
  if (m) {
    const prop = m[1].toLowerCase();
    const value = m[2];
    const cls = classify(prop);
    if (COLOR_RE.test(value)) {
      COLOR_RE.lastIndex = 0;
      pending = { cls, value, startLine: lineNo };
      if (!value.includes(";") && !stripped.trim().endsWith(";")) {
        /* may continue on next line — keep pending */
      } else {
        flush();
      }
    }
    COLOR_RE.lastIndex = 0;
  }
}
flush();

const byClass = {};
for (const [key, n] of counts) {
  const [cls, value] = key.split("|");
  (byClass[cls] ||= []).push([value, n]);
}

for (const cls of Object.keys(byClass).sort()) {
  const rows = byClass[cls].sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, r) => s + r[1], 0);
  console.log(`\n=== ${cls} — ${rows.length} distinct, ${total} uses ===`);
  for (const [value, n] of rows) {
    console.log(`${String(n).padStart(4)}  ${value}`);
  }
}
