#!/usr/bin/env node
/**
 * build-tokens.mjs — deriva artefactos desde la FUENTE ÚNICA tokens/tokens.json.
 *
 *   tokens.json ──▶ src/theme.css   (@theme para Tailwind v4)
 *
 * theme.css es GENERADO. No editarlo a mano.
 * Cambias un token en tokens.json → propaga a CSS (y docs). Cero desincronización.
 * (El exporter pptx de Fase 6 consumirá tokens.json directo — no se genera nada aún.)
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "tokens", "tokens.json");
const OUT_CSS = join(ROOT, "src", "theme.css");

const isToken = (v) => v && typeof v === "object" && "$value" in v;

/** Recorre el árbol de tokens; llama cb(pathArray, tokenObj) en cada hoja. */
function walk(node, path, cb) {
  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (isToken(val)) cb([...path, key], val);
    else if (val && typeof val === "object") walk(val, [...path, key], cb);
  }
}

/** Serializa un $value W3C a string CSS. */
function cssValue(v) {
  if (Array.isArray(v)) return v.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(", ");
  return String(v);
}

const tokens = JSON.parse(await readFile(SRC, "utf8"));

// ---------- theme.css ----------
const color = [];
const font = [];
const text = [];
const radius = [];

walk(tokens.color, ["color"], (p, t) => {
  color.push(`  --color-${p[1]}: ${cssValue(t.$value)};`);
});
walk(tokens.font, ["font"], (p, t) => {
  font.push(`  --font-${p[1]}: ${cssValue(t.$value)};`);
});
walk(tokens.text, ["text"], (p, t) => {
  const name = p[1];
  const ext = (t.$extensions && t.$extensions.neo) || {};
  text.push(`  --text-${name}: ${cssValue(t.$value)};`);
  if (ext.lineHeight)    text.push(`  --text-${name}--line-height: ${ext.lineHeight};`);
  if (ext.letterSpacing) text.push(`  --text-${name}--letter-spacing: ${ext.letterSpacing};`);
  if (ext.fontWeight)    text.push(`  --text-${name}--font-weight: ${ext.fontWeight};`);
});
walk(tokens.radius, ["radius"], (p, t) => {
  radius.push(`  --radius-${p[1]}: ${cssValue(t.$value)};`);
});

// Aliases cortos (var(--navy)/var(--r-*)) para autoría de componentes.
const legacy = [];
walk(tokens.color, ["color"], (p) => {
  legacy.push(`  --${p[1]}: var(--color-${p[1]});`);
});
walk(tokens.radius, ["radius"], (p) => {
  legacy.push(`  --r-${p[1]}: var(--radius-${p[1]});`);
});
legacy.push(`  --slide-w: ${tokens.canvas.w.$value};`);
legacy.push(`  --slide-h: ${tokens.canvas.h.$value};`);
legacy.push(`  --gutter: ${tokens.space.gutter.$value};`);

const css = `/* ============================================================================
   theme.css — GENERADO desde tokens/tokens.json por tools/build-tokens.mjs
   NO EDITAR A MANO. Editar tokens.json y correr \`npm run tokens\`.
   ============================================================================ */
@theme {
  /* --- El cierre: matar namespaces default. Solo tokens NEO generan utilidades. --- */
  --color-*: initial;
  --text-*: initial;
  --font-*: initial;

  /* --- Color --- */
${color.join("\n")}

  /* --- Tipografía (familias) --- */
${font.join("\n")}

  /* --- Escala tipográfica fija (utilidades text-*) --- */
${text.join("\n")}

  /* --- Radii --- */
${radius.join("\n")}
}

/* --- Aliases cortos + canvas: autoría de componentes con var(--navy) --- */
:root {
${legacy.join("\n")}
}
`;
await writeFile(OUT_CSS, css);

console.log(`✓ theme.css  (${color.length} color, ${text.length} text lines, ${radius.length} radius)`);
