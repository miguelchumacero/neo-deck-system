# neo-ui

Design system de **slides/decks** de NEO Consulting (`neoconsulting.ai`), formato
**1920×1080**. Fuente única de tokens, marca, assets y componentes de slide. El agente
genera HTML mínimo y semántico; esta librería sirve todo el estilo vía un solo CSS
precompilado.

Ver [`PLAN.md`](./PLAN.md) para la visión completa y el roadmap por fases.

## Uso (consumidor)

Linkea **un** archivo. Nada de build, nada de CDN, offline:

```html
<link rel="stylesheet" href="dist/neo-ui.css">
```

HTML objetivo — componente = clase semántica, layout = subset de utilidades:

```html
<section class="slide">
  <p class="eyebrow">Sección</p>
  <h1 class="h1">Título <em class="acc">con acento</em></h1>
  <div class="grid grid-cols-3 gap-8">
    <article class="card">…</article>
  </div>
</section>
```

## Desarrollo (mantenedor)

```bash
npm install
npm run build      # tokens.json → theme.css, luego Tailwind → dist/neo-ui.css
npm run css:dev    # watch mode
```

**El mantenedor buildea; el agente nunca buildea** — solo linkea `dist/neo-ui.css`.

### Pipeline

```
tokens/tokens.json  ──build-tokens──▶  src/theme.css (@theme)   ──┐
src/primitives.css · src/components.css · safelist ──────────────┼─Tailwind─▶ dist/neo-ui.css
                                                                  ┘
```

`tokens.json` es la **fuente única**. `src/theme.css` es **generado** — no editar a mano.

## Estructura

| Ruta | Qué |
|---|---|
| `tokens/tokens.json` | Fuente única (W3C Design Tokens) |
| `src/theme.css` | `@theme` generado (color/tipo/radii + cierre de namespaces) |
| `src/primitives.css` | `.slide` (canvas), tipografía, cromo, fuentes |
| `src/components.css` | `@layer components` — los "Lego" de slide |
| `src/input.css` | Entry de build + safelist (`@source inline`) |
| `safelist.txt` | Allowlist legible de utilidades de layout |
| `dist/neo-ui.css` | Artefacto precompilado |
| `assets/` | fonts, logos, backgrounds |
| `reference/gallery.html` | Styleguide vivo |
| `tools/` | `build-tokens.mjs`, `build-docs.mjs`, `lint.mjs` |

## Reglas de marca (guardrails)

Ver `PLAN.md §7`. Resumen: solo tokens (cero hex crudo) · escala tipográfica fija ·
canvas 1920×1080 sin overflow · navy solo en portada/divisor/cierre · sobre navy usar
`--blue-light` (nunca `--blue`) · es-PE · 🚀 solo en Logros.
