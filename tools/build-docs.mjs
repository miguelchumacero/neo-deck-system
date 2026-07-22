#!/usr/bin/env node
/**
 * build-docs.mjs — genera la galería/catálogo desde la FUENTE ÚNICA src/components.css.
 *
 *   components.css (@component + @example) ──▶ reference/gallery.html
 *
 * gallery.html es GENERADO. No editarlo a mano (antes se mantenía a mano → se
 * desincronizaba). Agregar un componente = un solo sitio (components.css); aparece
 * en la galería sin doble edición.
 *
 * Convención de doc en components.css (co-ubicada con cada regla):
 *   @component .nombre — descripción corta (puede ocupar varias líneas)
 *   @preview <clases>   (opcional) clases extra del <section> wrapper del preview
 *                       — solo para fragmentos que necesitan contexto (ej. dark-bg)
 *   @example <html que demuestra el componente>  (hasta el cierre del comentario)
 *
 * El orden de la galería = orden de aparición en components.css (determinista).
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src", "components.css");
const OUT = join(ROOT, "reference", "gallery.html");

/** Quita indentación común + líneas vacías de los extremos. */
function dedent(text) {
  let lines = text.replace(/\r\n/g, "\n").split("\n");
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Extrae los bloques @component de los comentarios de components.css. */
function parse(css) {
  const comps = [];
  // Solo comentarios DENTRO de @layer components — el header del archivo documenta
  // la convención (@component .nombre …) y no es un componente real.
  const layerAt = css.indexOf("@layer components");
  const scope = layerAt === -1 ? css : css.slice(layerAt);
  const comments = scope.match(/\/\*[\s\S]*?\*\//g) || [];
  for (const raw of comments) {
    const body = raw.slice(2, -2); // sin /* */
    if (!/@component/.test(body)) continue;

    const afterComp = body.slice(body.indexOf("@component") + "@component".length);
    const exIdx = afterComp.indexOf("@example");
    if (exIdx === -1) continue;

    const decl = afterComp.slice(0, exIdx);
    let example = dedent(afterComp.slice(exIdx + "@example".length));

    const name = (decl.match(/\.[-\w]+/) || [""])[0];
    // desc = todo tras el "—" (o tras el nombre si no hay), sin @preview, colapsado.
    let desc = decl.replace(/@preview\s+[^\n]+/g, "");
    desc = desc.includes("—") ? desc.slice(desc.indexOf("—") + 1) : desc.replace(name, "");
    desc = desc.replace(/\s+/g, " ").trim();

    const preview = (decl.match(/@preview\s+([^\n]+)/) || [, ""])[1].trim();

    comps.push({ name, desc, preview, example });
  }
  return comps;
}

/** Envuelve el @example en un <section class="slide"> si es un fragmento. */
function frame(c) {
  const html = c.example.trim();
  if (/^<section\b/.test(html)) return c.example; // ya es una slide completa
  const cls = ["slide", c.preview].filter(Boolean).join(" ");
  const inner = c.example.split("\n").map((l) => "      " + l).join("\n");
  return `<section class="${cls}">\n    <div class="stack">\n${inner}\n    </div>\n  </section>`;
}

const css = await readFile(SRC, "utf8");
const comps = parse(css);

const specimens = comps
  .map(
    (c) => `    <section class="specimen" id="${c.name.slice(1)}">
      <div class="specimen-meta">
        <code>${c.name}</code>
        <p>${esc(c.desc)}</p>
      </div>
      <div class="deck">
  ${frame(c)}
      </div>
      <details class="specimen-src">
        <summary>HTML</summary>
        <pre><code>${esc(c.example.trim())}</code></pre>
      </details>
    </section>`
  )
  .join("\n\n");

const html = `<!doctype html>
<html lang="es-PE">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>neo-ui · galería (generada)</title>
  <link rel="stylesheet" href="../dist/neo-ui.css">
  <style>
    /* Cromo de la galería — NO forma parte del kit. gallery.html es GENERADO
       por tools/build-docs.mjs (npm run docs); no editar a mano. */
    body { margin: 0; background: #f4f4f8; font-family: system-ui, sans-serif; color: #1a1a2e; }
    .gallery-head { padding: 32px 48px 8px; }
    .gallery-head h1 { margin: 0; font-size: 22px; }
    .gallery-head p { margin: 4px 0 0; color: #6a6a80; font-size: 13px; }
    .specimens { display: flex; flex-direction: column; gap: 8px; padding: 24px 0 64px; }
    .specimen { border-top: 1px solid #dcdce6; padding: 24px 48px; }
    .specimen-meta { margin-bottom: 12px; }
    .specimen-meta code {
      font: 600 15px/1 ui-monospace, monospace; color: #05058c;
      background: #eeebfb; padding: 4px 10px; border-radius: 6px;
    }
    .specimen-meta p { margin: 8px 0 0; max-width: 900px; color: #4a4a60; font-size: 14px; }
    /* Escala de preview: cada slide 1920×1080 se reduce para caber en pantalla. */
    .deck { zoom: 0.5; width: max-content; }
    .specimen-src { margin-top: 12px; }
    .specimen-src summary { cursor: pointer; font-size: 12px; color: #6a6a80; }
    .specimen-src pre {
      overflow-x: auto; background: #14142a; color: #e8e8f4; border-radius: 8px;
      padding: 16px; font-size: 12px; line-height: 1.5; margin: 8px 0 0;
    }
  </style>
</head>
<body>
  <header class="gallery-head">
    <h1>neo-ui · galería</h1>
    <p>Generada desde <code>src/components.css</code> por <code>npm run docs</code>. ${comps.length} componentes.</p>
  </header>
  <div class="specimens">
${specimens}
  </div>
</body>
</html>
`;

await writeFile(OUT, html);
console.log(`✓ gallery.html  (${comps.length} componentes: ${comps.map((c) => c.name).join(", ")})`);
