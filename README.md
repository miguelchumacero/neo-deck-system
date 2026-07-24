# neo-ui

Design system de **slides/decks** de NEO Consulting (`neoconsulting.ai`), formato
**1920×1080**. Fuente única de tokens, marca, assets y componentes de slide. El agente
genera HTML mínimo y semántico; esta librería sirve todo el estilo vía un solo CSS
precompilado.

Ver [`PLAN.md`](./PLAN.md) para la visión completa y el roadmap por fases.

## Uso (consumidor)

Linkea **un** archivo. Nada de build, nada de CDN:

```html
<!-- servido (producción): pinnea la versión -->
<link rel="stylesheet" href="https://neo-ui-466944173234.us-central1.run.app/dist/neo-ui@0.1.0.css">

<!-- local / dev: alias latest -->
<link rel="stylesheet" href="dist/neo-ui.css">
```

El CSS trae fuentes, logos y fondos por ruta relativa al host, con CORS abierto.

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

## Despliegue

```bash
./scripts/deploy.sh        # buildea, genera catálogo, pinnea versión y sube a Cloud Run
```

Servicio `neo-ui` (proyecto `brain-clientes`, `us-central1`), nginx estático, scale-to-zero.
Webroot = `index.html` + `dist/` + `assets/` + `reference/` + `tokens/`. El deploy genera
`dist/neo-ui@<version>.css` (pinneado, cache inmutable) además del alias `dist/neo-ui.css`;
esa copia **se commitea**, así la imagen sirve todas las versiones pasadas y un deck emitido
con una versión vieja nunca queda en 404. Consumidor: `neo-propuestas` (resource
`neo://maquetado`) pinnea la versión.

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
| `dist/neo-ui.css` | Artefacto precompilado (alias latest) + copias `neo-ui@x.y.z.css` pinneadas |
| `assets/` | fonts, logos, backgrounds |
| `reference/gallery.html` | Styleguide vivo |
| `tools/` | `build-tokens.mjs`, `build-docs.mjs` (`lint.mjs` pendiente — Fase 3) |
| `Dockerfile` · `default.conf` · `scripts/deploy.sh` | Serving estático en Cloud Run |

## Reglas de marca (guardrails)

Ver `PLAN.md §7`. Resumen: solo tokens (cero hex crudo) · escala tipográfica fija ·
canvas 1920×1080 sin overflow · navy solo en portada/divisor/cierre · sobre navy usar
`--blue-light` (nunca `--blue`) · es-PE · 🚀 solo en Logros.
