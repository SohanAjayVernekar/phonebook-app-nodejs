/*
 * =========================================================
 * redesign-css.mjs — tokenise style.css
 * =========================================================
 *
 *  node scripts/redesign-css.mjs report   → list unmapped pairs
 *  node scripts/redesign-css.mjs apply    → rewrite style.css
 *
 * What `apply` does:
 *   1. Replaces the shell block (file start → COMMON) with
 *      scripts/shell.css (hand-written, token-based).
 *   2. Deletes the forced DARK LOGIN / DARK REGISTER blocks.
 *   3. Replaces every remaining colour literal with a
 *      var(--token) reference, except the landing/cover
 *      section which intentionally stays dark in both themes.
 *
 * The original file is backed up to .backup/style.css.orig
 * on first apply.
 * =========================================================
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(root, "src/style.css");
const shellPath = join(dirname(fileURLToPath(import.meta.url)), "shell.css");

const MODE = process.argv[2] || "report";

const css = readFileSync(cssPath, "utf8");

/* -------------------------------------------------------
   Section helpers (marker-based, robust to line shifts)
------------------------------------------------------- */

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sectionStart = (title) => {
  const re = new RegExp(`/\\*[\\s=]*\\n\\s*${esc(title)}\\s*\\n\\s*=`);
  const m = re.exec(css);
  if (!m) throw new Error(`Section not found: ${title}`);
  return m.index;
};

const shellEnd = sectionStart("COMMON");
const darkLogin = [
  sectionStart("DARK LOGIN THEME"),
  sectionStart("REGISTER PAGE"),
];
const loginDemoIdx = css.indexOf(".login-demo {");
if (loginDemoIdx === -1) throw new Error(".login-demo marker not found");
const darkRegister = [sectionStart("DARK REGISTER THEME"), loginDemoIdx];
const landing = [
  sectionStart("LANDING PAGE"),
  sectionStart("CONTACT CATEGORY"),
];

const inRange = (pos, [a, b]) => pos >= a && pos < b;

/* regions whose colours are left untouched / deleted */
const excluded = (pos) =>
  pos < shellEnd ||
  inRange(pos, darkLogin) ||
  inRange(pos, darkRegister) ||
  inRange(pos, landing);

/* -------------------------------------------------------
   CSS parser → rules[] { selector, decls[] }
------------------------------------------------------- */

const rules = [];

{
  let i = 0;
  const n = css.length;

  const skipComment = () => {
    if (css.startsWith("/*", i)) {
      const e = css.indexOf("*/", i + 2);
      i = e === -1 ? n : e + 2;
      return true;
    }
    return false;
  };

  const skipString = () => {
    const q = css[i];
    i++;
    while (i < n && css[i] !== q) {
      if (css[i] === "\\") i++;
      i++;
    }
    i++;
  };

  const parseDecls = (body, base, selector) => {
    /* split on top-level ';' */
    let depth = 0;
    let stmtStart = 0;
    const stmts = [];
    let j = 0;
    while (j < body.length) {
      const c = body[j];
      if (c === "/" && body[j + 1] === "*") {
        const e = body.indexOf("*/", j + 2);
        j = e === -1 ? body.length : e + 2;
        continue;
      }
      if (c === '"' || c === "'") {
        const q = c;
        j++;
        while (j < body.length && body[j] !== q) {
          if (body[j] === "\\") j++;
          j++;
        }
      } else if (c === "(") depth++;
      else if (c === ")") depth--;
      else if (c === ";" && depth === 0) {
        stmts.push([stmtStart, j]);
        stmtStart = j + 1;
      }
      j++;
    }
    stmts.push([stmtStart, body.length]);

    for (const [a, b] of stmts) {
      const stmt = body.slice(a, b);
      /* top-level colon */
      let d = 0;
      let colon = -1;
      for (let k = 0; k < stmt.length; k++) {
        const c = stmt[k];
        if (c === "(") d++;
        else if (c === ")") d--;
        else if (c === ":" && d === 0) {
          colon = k;
          break;
        }
        if (c === '"' || c === "'") {
          const q = c;
          k++;
          while (k < stmt.length && stmt[k] !== q) {
            if (stmt[k] === "\\") k++;
            k++;
          }
        }
      }
      if (colon === -1) continue;
      const prop = stmt.slice(0, colon).trim().toLowerCase();
      if (!/^[a-z-]+$/.test(prop)) continue;
      const value = stmt.slice(colon + 1);
      const valueStart = base + a + colon + 1;
      rules.push({ selector, prop, value, valueStart });
    }
  };

  const parseBlock = () => {
    while (i < n) {
      while (i < n && /\s/.test(css[i])) i++;
      if (i >= n) return;
      if (skipComment()) continue;
      if (css[i] === "}") {
        i++;
        return;
      }
      if (css[i] === "@") {
        while (i < n && css[i] !== "{" && css[i] !== ";") i++;
        if (css[i] === ";") {
          i++;
          continue;
        }
        if (css[i] === "{") {
          i++;
          parseBlock();
        }
        continue;
      }

      /* selector */
      const selStart = i;
      let depth = 0;
      while (i < n) {
        const c = css[i];
        if (c === "/" && css[i + 1] === "*") {
          const e = css.indexOf("*/", i + 2);
          i = e === -1 ? n : e + 2;
          continue;
        }
        if (c === '"' || c === "'") {
          skipString();
          continue;
        }
        if (c === "(") depth++;
        else if (c === ")") depth--;
        else if (c === "{" && depth === 0) break;
        else if (c === "}" && depth === 0) break;
        i++;
      }
      if (css[i] !== "{") {
        if (css[i] === "}") i++;
        continue;
      }
      const selector = css.slice(selStart, i).trim();
      i++; /* consume { */

      /* declarations body → matching } */
      const bodyStart = i;
      let d = 1;
      while (i < n && d > 0) {
        const c = css[i];
        if (c === "/" && css[i + 1] === "*") {
          const e = css.indexOf("*/", i + 2);
          i = e === -1 ? n : e + 2;
          continue;
        }
        if (c === '"' || c === "'") {
          skipString();
          continue;
        }
        if (c === "{") d++;
        else if (c === "}") d--;
        i++;
      }
      const bodyEnd = d === 0 ? i - 1 : n;
      parseDecls(css.slice(bodyStart, bodyEnd), bodyStart, selector);
      /* i is just past '}' */
    }
  };

  parseBlock();
}

/* -------------------------------------------------------
   Classification
------------------------------------------------------- */

const classify = (prop) => {
  if (
    prop === "color" ||
    prop === "fill" ||
    prop === "stroke" ||
    prop === "caret-color" ||
    prop === "accent-color" ||
    prop === "-webkit-text-fill-color"
  )
    return "text";
  if (prop.startsWith("background")) return "bg";
  if (
    prop.startsWith("border") ||
    prop === "outline" ||
    prop.startsWith("outline-") ||
    prop === "column-rule-color"
  )
    return "border";
  if (prop === "box-shadow" || prop === "text-shadow" || prop === "filter")
    return "shadow";
  return "other";
};

const isFormSelector = (sel) =>
  /\b(input|select|textarea)\b/i.test(sel);

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;

const normHex = (h) => {
  h = h.toLowerCase();
  if (h.length === 4) {
    return "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  if (h.length === 5) {
    return "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] + h[4] + h[4];
  }
  if (h.length === 7) return h;
  if (h.length === 9) return h.slice(0, 7); /* drop alpha channel for keys */
  return h;
};

const normRgb = (s) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ",")
    .replace(/\(\s+/, "(");

const keyOf = (raw) =>
  raw.startsWith("#") ? normHex(raw) : normRgb(raw);

/* luminance 0..1 (rgb only) */
const lum = (r, g, b) =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const hexToRgb = (h) => {
  h = normHex(h);
  if (h.length !== 7) return null;
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
};

const parseRgba = (s) => {
  const m = /^rgba?\(([^)]*)\)$/.exec(s);
  if (!m) return null;
  const parts = m[1].split(",").map((p) => p.trim());
  return [
    parseFloat(parts[0]),
    parseFloat(parts[1]),
    parseFloat(parts[2]),
    parts[3] !== undefined ? parseFloat(parts[3]) : 1,
  ];
};

/* -------------------------------------------------------
   MAP — exact `class|value` → token or literal
------------------------------------------------------- */

const MAP = {
  /* ---------- TEXT ---------- */
  "text|#101828": "--text-primary",
  "text|#172033": "--text-primary",
  "text|#111827": "--text-primary",
  "text|#344054": "--text-secondary",
  "text|#475467": "--text-secondary",
  "text|#374151": "--text-secondary",
  "text|#667085": "--text-muted",
  "text|#6b7280": "--text-muted",
  "text|#7a8494": "--text-muted",
  "text|#8a94a4": "--text-muted",
  "text|#778399": "--text-muted",
  "text|#98a2b3": "--text-faint",
  "text|#9ca3af": "--text-faint",
  "text|#a0a9b7": "--text-faint",
  "text|#c4cbd6": "--text-faint",
  "text|#cbd5e1": "--text-faint",
  "text|#b6c7dc": "--text-secondary",
  "text|#9fb5d1": "--text-secondary",
  "text|#ffffff": "--text-on-accent",

  "text|#2563eb": "--text-link",
  "text|#1d4ed8": "--text-link",
  "text|#4f46e5": "--text-link",
  "text|#4338ca": "--text-link",
  "text|#3730a3": "--text-link",
  "text|#4285f4": "--text-link",
  "text|#8cc8ff": "--text-link",
  "text|#1d4b78": "--accent-text",
  "text|#3346d3": "--accent-text",

  "text|#be123c": "--danger-text",
  "text|#b91c1c": "--danger-text",
  "text|#e11d48": "--danger-text",
  "text|#ef4444": "--danger-text",
  "text|#15803d": "--success-text",
  "text|#16a34a": "--success-text",
  "text|#c2410c": "--warning-text",
  "text|#7c3aed": "--violet-text",

  /* ---------- BACKGROUND ---------- */
  "bg|#ffffff": "--bg-card",
  "bg|#f6f8fc": "--bg-app",
  "bg|#f5f7fb": "--bg-app",
  "bg|#f2f4f7": "--bg-inset",
  "bg|#f9fafb": "--bg-inset",
  "bg|#f8fafc": "--bg-inset",
  "bg|#f8fafd": "--bg-inset",
  "bg|#eef1f6": "--bg-inset",
  "bg|#eef2f6": "--bg-inset",
  "bg|#eef2f7": "--bg-inset",
  "bg|#e4e9f0": "--bg-inset",
  "bg|#e5e7eb": "--bg-inset",
  "bg|#101828": "--bg-elevated",
  "bg|#111827": "--bg-elevated",

  "bg|#eff6ff": "--accent-soft",
  "bg|#eef2ff": "--accent-soft",
  "bg|#f0f3ff": "--accent-soft",
  "bg|#f4f6ff": "--accent-soft",
  "bg|#f5f7ff": "--accent-soft",
  "bg|#f7f9ff": "--accent-soft",
  "bg|#f8faff": "--accent-soft",
  "bg|#f9fbff": "--accent-soft",
  "bg|#e6eaff": "--accent-soft",
  "bg|#fff7f8": "--bg-inset",
  "bg|#f5f3ff": "--violet-soft",
  "bg|#ecfdf3": "--success-soft",
  "bg|#f0fdf4": "--success-soft",
  "bg|#fff1f2": "--danger-soft",
  "bg|#fff1f3": "--danger-soft",
  "bg|#fff5f6": "--danger-soft",
  "bg|#fff8f9": "--danger-soft",
  "bg|#ffecee": "--danger-soft",
  "bg|#fef2f2": "--danger-soft",
  "bg|#fff7ed": "--warning-soft",

  "bg|#2563eb": "--accent",
  "bg|#3b82f6": "--accent",
  "bg|#1d4ed8": "--accent-hover",
  "bg|#1948b9": "--accent-hover",
  "bg|#2257d6": "--accent",
  "bg|#4f46e5": "--accent-alt",
  "bg|#6366f1": "--accent-alt",
  "bg|#22c55e": "--success",
  "bg|#4ade80": "--success",
  "bg|rgba(15,23,42,0.42)": "--bg-mask",

  "bg|rgba(255,255,255,0.75)": "--bg-glass",
  "bg|rgba(255,255,255,0.76)": "--bg-glass",
  "bg|rgba(255,255,255,0.78)": "--bg-glass",
  "bg|rgba(255,255,255,0.8)": "--bg-glass",
  "bg|rgba(255,255,255,0.05)": "--bg-hover",

  /* skeletons */
  "bg|#e9edf4": "--skeleton-a",
  "bg|#f4f6fa": "--skeleton-b",

  /* ---------- BORDER ---------- */
  "border|#e7ebf1": "--border",
  "border|#e8ecf2": "--border",
  "border|#edf0f4": "--border",
  "border|#e6eaf0": "--border",
  "border|#e1e6ee": "--border",
  "border|#dde3eb": "--border",
  "border|#dfe4eb": "--border",
  "border|#dfe4ec": "--border",
  "border|#dfe5ed": "--border",
  "border|#e0e5ec": "--border",
  "border|#e3e8f0": "--border",
  "border|#e5e9f0": "--border",
  "border|#e5e7eb": "--border",
  "border|#d9dee7": "--border",
  "border|#d9deea": "--border",
  "border|#d7dcf2": "--border",
  "border|#f1f4f8": "--border",
  "border|#eef1f5": "--border",
  "border|#cfd6e2": "--border-strong",
  "border|#cbd5e1": "--border-strong",
  "border|#d1d5db": "--border-strong",
  "border|#d9dee8": "--border-input",
  "border|#ffffff": "--border-glass",
  "border|rgba(255,255,255,0.9)": "--border-glass",
  "border|rgba(255,255,255,0.4)": "--on-accent-dim",

  "border|#fecdd3": "--danger-border",
  "border|#ffe0e4": "--danger-border",
  "border|#fecaca": "--danger-border",
  "border|#fda4af": "--danger-border",
  "border|#bbf7d0": "--success-border",
  "border|#fed7aa": "--warning-border",

  "border|#c7d2fe": "--accent-border",
  "border|#dfe4ff": "--accent-border",
  "border|#dbe1ff": "--accent-border",
  "border|#dbe3ff": "--accent-border",
  "border|#bfdbfe": "--accent-border",
  "border|#a5b4fc": "--accent-border",

  "border|#818cf8": "--focus-border",
  "border|#2563eb": "--accent",
  "border|#4f46e5": "--accent-alt",
  "border|#6366f1": "--accent-alt",
  "border|rgba(99,102,241,0.18)": "rgba(var(--focus-rgb), 0.35)",

  /* ---------- SHADOW ---------- */
  "shadow|rgba(37,99,235,0.13)": "rgba(var(--accent-rgb), 0.16)",
  "shadow|rgba(37,99,235,0.14)": "rgba(var(--accent-rgb), 0.18)",
  "shadow|rgba(74,222,128,0.14)": "rgba(var(--success-rgb), 0.14)",
  "shadow|rgba(34,87,214,0.2)": "rgba(var(--accent-rgb), 0.22)",
  "shadow|rgba(34,87,214,0.28)": "rgba(var(--accent-rgb), 0.3)",
  "shadow|rgba(99,102,241,0.08)": "rgba(var(--focus-rgb), 0.25)",
  "shadow|rgba(67,56,202,0.08)": "rgba(var(--accent-rgb), 0.16)",
  "shadow|rgba(190,18,60,0.07)": "rgba(var(--danger-rgb), 0.14)",
  "shadow|rgba(79,70,229,0.18)": "rgba(var(--accent-rgb), 0.3)",
  "shadow|rgba(79,70,229,0.16)": "rgba(var(--accent-rgb), 0.28)",
  "shadow|#4f46e5": "--accent-alt",
  "shadow|#818cf8": "--focus-border",
};

/* selector-context overrides: [selectorRegex, class, value, replacement] */
const OVERRIDES = [
  [
    /\.dashboard-heading\s+h1/i,
    "bg",
    "#101828",
    "var(--text-primary)",
  ],
  [/\.\S*h1/i, "bg", "#101828", "var(--text-primary)"],
  [/\.dashboard-heading\s+h1/i, "bg", "#1d4ed8", "var(--accent-hover)"],
  [/\.category-work/i, "bg", "#eff6ff", "var(--cat-work-bg)"],
  [/\.category-work/i, "text", "#2563eb", "var(--cat-work-fg)"],
  [/\.category-family/i, "bg", "#fff7ed", "var(--cat-family-bg)"],
  [/\.category-family/i, "text", "#c2410c", "var(--cat-family-fg)"],
  [/\.category-friend/i, "bg", "#ecfdf3", "var(--cat-friend-bg)"],
  [/\.category-friend/i, "text", "#15803d", "var(--cat-friend-fg)"],
  [
    /\.(login|register)-submit/i,
    "bg",
    "#111827",
    "linear-gradient(135deg, var(--accent), var(--accent-alt))",
  ],
];

/* generic transforms by class (used before the fallback band) */
const transform = (cls, raw) => {
  const rgba = parseRgba(raw);
  if (rgba && cls === "shadow") {
    const [r, g, b, a] = rgba;
    if (r === 15 && g === 23 && b === 42)
      return `rgba(var(--shadow-rgb), ${a})`;
    if (r === 0 && g === 0 && b === 0) return `rgba(var(--shadow-rgb), ${a})`;
    if (r === 37 && g === 99 && b === 235)
      return `rgba(var(--accent-rgb), ${a})`;
    if (r === 34 && g === 87 && b === 214)
      return `rgba(var(--accent-rgb), ${a})`;
    if (r === 255 && g === 255 && b === 255)
      return `rgba(var(--sheen-rgb), ${a})`;
    if (r === 99 && g === 102 && b === 241)
      return `rgba(var(--focus-rgb), ${a < 0.15 ? 0.25 : a})`;
    if (r === 74 && g === 222 && b === 128)
      return `rgba(var(--success-rgb), ${a})`;
    if (r === 34 && g === 197 && b === 94)
      return `rgba(var(--success-rgb), ${a})`;
    if (r === 239 && g === 68 && b === 68)
      return `rgba(var(--danger-rgb), ${a})`;
    if (r === 245 && g === 158 && b === 11)
      return `rgba(var(--warning-rgb), ${a})`;
  }

  if (rgba && cls === "bg") {
    const [r, g, b, a] = rgba;
    if (r === 255 && g === 255 && b === 255) {
      if (a >= 0.6) return "var(--bg-glass)";
      if (a >= 0.1) return `rgba(255, 255, 255, ${a})`; /* handled by exact map mostly */
      return "var(--bg-hover)";
    }
    if (r === 15 && g === 23 && b === 42) return `rgba(var(--shadow-rgb), ${a})`;
    if (r === 37 && g === 99 && b === 235) return `rgba(var(--accent-rgb), ${a})`;
    if (r === 59 && g === 130 && b === 246) return `rgba(var(--accent-rgb), ${a})`;
    if (r === 99 && g === 102 && b === 241)
      return `rgba(var(--accent-alt-rgb), ${a})`;
  }

  if (rgba && cls === "border") {
    const [r, g, b, a] = rgba;
    if (r === 15 && g === 23 && b === 42) return `rgba(var(--shadow-rgb), ${a})`;
    if (r === 37 && g === 99 && b === 235) return `rgba(var(--accent-rgb), ${a})`;
    if (r === 99 && g === 102 && b === 241)
      return `rgba(var(--focus-rgb), ${a < 0.25 ? 0.35 : a})`;
    if (r === 255 && g === 255 && b === 255)
      return `rgba(var(--sheen-rgb), ${a})`;
  }

  if (rgba && cls === "text") {
    const [r, g, b] = rgba;
    if (r === 255 && g === 255 && b === 255) return "var(--text-on-accent)";
    if (r === 15 && g === 23 && b === 42) return "var(--text-primary)";
    if (r === 37 && g === 99 && b === 235) return "var(--text-link)";
    if (r === 79 && g === 70 && b === 229) return "var(--text-link)";
    if (r === 99 && g === 102 && b === 241) return "var(--text-link)";
  }

  return null;
};

/* luminance fallback bands (only when no exact match) */
const fallback = (cls, raw) => {
  let rgb = null;
  if (raw.startsWith("#")) rgb = hexToRgb(raw);
  else rgb = parseRgba(raw);
  if (!rgb) return null;
  const L = lum(rgb[0], rgb[1], rgb[2]);
  const alpha = rgb[3] !== undefined ? rgb[3] : 1;

  if (cls === "text") {
    if (L < 0.22) return "--text-primary";
    if (L < 0.45) return "--text-secondary";
    if (L < 0.66) return "--text-muted";
    if (L < 0.85) return "--text-faint";
    return "--text-on-accent";
  }
  if (cls === "bg") {
    if (L < 0.3) return "--bg-elevated";
    if (L < 0.86) return "--bg-inset";
    return "--bg-card";
  }
  if (cls === "border") {
    if (L < 0.45) return "--border-strong";
    if (L < 0.86) return "--border";
    return "--border-subtle";
  }
  if (cls === "shadow") return null;
  return null;
};

const resolve = (cls, raw, selector) => {
  const key = `${cls}|${keyOf(raw)}`;

  /* selector overrides first */
  for (const [selRe, oCls, oVal, repl] of OVERRIDES) {
    if (oCls === cls && keyOf(oVal) === keyOf(raw) && selRe.test(selector)) {
      return repl.startsWith("--") ? `var(${repl})` : repl;
    }
  }

  if (MAP[key]) {
    const t = MAP[key];
    return t.startsWith("--") ? `var(${t})` : t;
  }

  const t = transform(cls, keyOf(raw));
  if (t) return t;

  /* form controls get raised inputs */
  if (cls === "bg" && isFormSelector(selector) && /^#[0-9a-f]{6}$/.test(keyOf(raw))) {
    const rgb = hexToRgb(raw);
    if (rgb && lum(...rgb) > 0.9) return "var(--bg-input)";
  }

  const fb = fallback(cls, keyOf(raw));
  if (fb) return `var(${fb})`;

  return null;
};

/* -------------------------------------------------------
   Walk declarations, build replacements + report
------------------------------------------------------- */

const replacements = []; /* {start, end, text} */
const unmapped = new Map(); /* key → {count, samples[]} */
const mapped = new Map();

const lineAt = (() => {
  const starts = [0];
  for (let k = 0; k < css.length; k++) {
    if (css[k] === "\n") starts.push(k + 1);
  }
  return (pos) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
})();

for (const rule of rules) {
  const cls = classify(rule.prop);
  if (cls === "other") continue;

  const value = rule.value;
  COLOR_RE.lastIndex = 0;
  let m;
  while ((m = COLOR_RE.exec(value))) {
    const raw = m[0];
    const absStart = rule.valueStart + m.index;
    const absEnd = absStart + raw.length;

    /* never touch colours inside url(...) */
    const before = value.slice(0, m.index);
    if (/url\([^)]*$/.test(before)) continue;

    if (excluded(absStart)) continue;

    const k = `${cls}|${keyOf(raw)}`;
    const repl = resolve(cls, raw, rule.selector);

    if (repl === null) {
      const entry = unmapped.get(k) || { count: 0, samples: [] };
      entry.count++;
      if (entry.samples.length < 4) {
        entry.samples.push(`${rule.selector} { ${rule.prop} } @${lineAt(absStart)}`);
      }
      unmapped.set(k, entry);
      continue;
    }

    mapped.set(k, (mapped.get(k) || 0) + 1);
    replacements.push({ start: absStart, end: absEnd, text: repl });
  }
}

/* -------------------------------------------------------
   REPORT
------------------------------------------------------- */

if (MODE === "report") {
  console.log(`rules: ${rules.length}`);
  console.log(`colour occurrences mapped: ${replacements.length}`);
  console.log(`distinct mapped pairs: ${mapped.size}`);
  console.log(`distinct UNMAPPED pairs: ${unmapped.size}\n`);

  const rows = [...unmapped.entries()].sort(
    (a, b) => b[1].count - a[1].count
  );
  for (const [k, v] of rows) {
    console.log(`${String(v.count).padStart(3)}  ${k}`);
    for (const s of v.samples) console.log(`      ${s}`);
  }
  process.exit(0);
}

/* -------------------------------------------------------
   APPLY
------------------------------------------------------- */

if (MODE === "apply") {
  if (unmapped.size > 0) {
    console.error(
      `Refusing: ${unmapped.size} unmapped pair(s). Run "report" first.`
    );
    process.exit(1);
  }

  /* backup on first run */
  mkdirSync(join(root, ".backup"), { recursive: true });
  const bak = join(root, ".backup", "style.css.orig");
  if (!existsSync(bak)) writeFileSync(bak, css);

  /* 1. colour replacements (skip regions we delete/splice) */
  replacements.sort((a, b) => b.start - a.start);
  let out = css;
  for (const r of replacements) {
    out = out.slice(0, r.start) + r.text + out.slice(r.end);
  }

  /* 2. splice regions on the ORIGINAL offsets — easier to do
        all edits against `out` using marker search instead. */
  const marker = (title) => {
    const re = new RegExp(`/\\*[\\s=]*\\n\\s*${esc(title)}\\s*\\n\\s*=`);
    const mm = re.exec(out);
    if (!mm) throw new Error(`marker missing after tokenize: ${title}`);
    return mm.index;
  };

  const shellStop = marker("COMMON");
  const dlStart = marker("DARK LOGIN THEME");
  const regPageStart = marker("REGISTER PAGE");
  const drStart = marker("DARK REGISTER THEME");
  const demoIdx = out.indexOf(".login-demo {");
  if (demoIdx === -1) throw new Error(".login-demo missing after tokenize");

  const shellCss = readFileSync(shellPath, "utf8");

  /* delete DARK REGISTER first (later in file), then DARK LOGIN,
     then replace the shell — offsets stay valid that order. */
  out = out.slice(0, drStart) + out.slice(demoIdx);
  out = out.slice(0, dlStart) + out.slice(regPageStart - (dlStart < regPageStart ? 0 : 0));
  /* careful: after the first deletion, REGISTER PAGE start index unchanged
     (it precedes drStart) — but we captured it from the ALREADY edited
     string? regPageStart was computed on `out` BEFORE the dr deletion.
     Since drStart > regPageStart, deleting [drStart, demoIdx) does not
     shift regPageStart. Safe. */

  out = shellCss + out.slice(shellStop);

  writeFileSync(cssPath, out);

  console.log(
    `apply ok — ${replacements.length} colours tokenised, ` +
      `shell replaced, dark login/register blocks removed.`
  );
  console.log(`backup: ${bak}`);
} 
