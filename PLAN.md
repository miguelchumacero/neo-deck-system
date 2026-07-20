# neo-ui — Plan

Design system de **slides/decks** de NEO Consulting (`neoconsulting.ai`), formato
1920×1080. Fuente única de verdad para tokens, marca, assets y componentes de slide.
El agente (Claude) genera HTML limpio y semántico; esta librería sirve los estilos.

> **Estado:** Fase 0 (Fundación) completa. Pipeline de tokens + build Tailwind v4 +
> render verificado. Siguiente: Fase 1 (Paridad — migrar componentes + `fixed/`).

---

## 0 · Objetivo

Que Claude genere HTML **mínimo y semántico** y que la librería se encargue de todo el
estilo. Ejemplo del HTML objetivo:

```html
<section class="hero">
  <h1>Título</h1>
</section>

<div class="grid grid-cols-3 gap-8">
  <article class="card">…</article>
  <article class="card">…</article>
  <article class="card">…</article>
</div>
```

Componente = clase semántica. Layout = subset acotado de utilidades Tailwind. Cero
`style=` inline improvisado, cero hex crudo, cero "olor a IA".

---

## 1 · Decisiones tomadas

| Decisión | Elección |
|---|---|
| **Alcance** | **Solo slides/decks** (canvas 1920×1080). Sin modo web / fluido. |
| **Fuente única** | neo-ui es la única fuente. **neo-deck y neo-design-system se retiran.** neo-propuestas consume neo-ui. |
| **Pureza HTML** | **Híbrido controlado**: componentes = clases semánticas; layout = subset acotado de utilidades Tailwind (`grid-cols-3`, `gap-8`, `flex`). |
| **Serving** | **CSS precompilado estático** (`dist/neo-ui.css`). Agente linkea 1 archivo. Cero JS runtime (salvo escalado), cero CDN, offline, render instantáneo. |
| **Tailwind** | v4, **solo build-time**. Autoría con `@theme` + `@layer components` + `@apply`. |
| **Ingeniería** | Tokens como fuente real con pipeline de derivación · docs/galería generados · semver + versionado del artefacto · CI con gate (build + lint + visual regression) · arquitectura en capas. |

### Alcance — qué absorbe y qué no

**Absorbe** (necesario para slides):
- tokens (color / type / spacing / radii)
- assets: fonts, logos, backgrounds (patrón de puntos), íconos
- reglas de marca (dark/light/mixed · navy solo portada/divisor/cierre · 🚀 solo en Logros · es-PE)
- componentes de slide + `fixed/` + galería + `neo-kit.js` (escalado en pantalla)

**No absorbe** (fuera de scope):
- componentes web-generales: dashboards, reportes, KPI cards web, tablas web
- cualquier layout fluido no-slide

Todo asume canvas 1920×1080. Un solo medio: slide. `pptx/Gslides` (Fase 6) es el único
no-HTML, pero sigue siendo slides (mismo contenido, otro formato).

---

## 2 · El cierre (guardrail mecánico)

`@theme` con namespaces default cerrados (Tailwind v4 permite `--<namespace>-*: initial`):

- `--color-*: initial` → solo tokens NEO generan utilidades. `bg-red-500` no existe.
- `--text-*: initial`, `--font-*: initial` → solo `text-hero/h1/h2/…` y
  `font-display/body`. La escala default de Tailwind muere.
- **Spacing / layout: se mantiene**, pero **acotado por safelist** (no todo Tailwind —
  palette curada). Esto es el "controlado" del híbrido.

Safelist (borrador — se afina en Fase 0):

```
grid grid-cols-{1,2,3,4} col-span-{1..4} gap-{4,6,8,10,12,16} gap-x-* gap-y-*
flex flex-col items-{start,center,end} justify-{start,center,between,end} flex-1
w-full h-full max-w-* text-{left,center,right} relative absolute hidden
p-* px-* py-* m-* mt-auto   (solo escala de marca)
```

**Reconciliación clave (híbrido + precompilado):** Tailwind tree-shakea — solo emite las
clases que ve en build. Pero el agente escribe HTML **nuevo** que el build nunca vio. Por
eso se **safelistea** el set de layout: `dist/neo-ui.css` incluye exactamente esa palette
+ todos los componentes semánticos. Arbitrary values (`p-[37px]`, `grid-cols-[5]`) nunca
se emiten → no funcionan → el linter también los caza. El guardrail es mecánico, no de
memoria.

---

## 3 · Arquitectura

### Tokens como fuente real, con pipeline de derivación

Nunca duplicar. Un solo archivo de tokens (formato W3C Design Tokens, `tokens.json`) =
autoridad. El build **deriva** todo lo demás:

```
tokens.json  ──build──▶  theme.css (@theme)      → CSS
             └─────────▶  docs / reference         → skill + catálogo
```

(El exporter pptx de Fase 6 consumirá `tokens.json` directo — sin artefacto intermedio.)

Cambias un color en un lugar → propaga a CSS y docs. Mata la desincronización
**por construcción**, no por disciplina.

### Capas (separación de responsabilidades)

```
theme (tokens)          ← qué: color / type / space / radii
  └ primitives          ← tipografía, .slide (canvas 1920×1080), cromo (cobrand/footer)
      └ components       ← .card .cron .tl .case-card ...
          └ patterns     ← composiciones de slide (fijos, bloque-central)
```

Cada capa depende solo de la de abajo. Un componente nunca hardcodea hex → solo
`var(--token)`.

### Docs / galería generados (no a mano)

El catálogo de componentes + la galería se **generan desde `components.css`** (parse de
`@layer components` + ejemplos co-ubicados). Agregar un componente = un solo sitio; aparece
en galería, en el reference del skill y en neo-propuestas sin doble edición. Esto es lo que
estructuralmente elimina el "editar 3 sitios" de hoy.

### Convención de nombres

Semántico, kebab-case (`.case-card`, `.cards-3`, `.stage-block`). Sin abreviaturas
crípticas. Regla escrita en `CONTRIBUTING.md`.

---

## 4 · Estructura del repo

```
neo-ui/
  tokens/
    tokens.json          # FUENTE ÚNICA (W3C Design Tokens)
  src/
    theme.css            # @theme — GENERADO de tokens.json
    primitives.css       # .slide, tipografía, cromo
    components.css        # @layer components
    input.css            # entry (@import tailwind + theme + primitives + components)
  safelist.txt           # allowlist de utilidades de layout
  dist/
    neo-ui@x.y.z.css     # precompilado, versionado (+ alias latest)
  assets/                # fonts, logos, backgrounds, íconos (migrados)
  fixed/                 # secciones locked (portadas, agenda, divisor, cronograma, cierre)
  reference/
    gallery.html         # styleguide vivo (generado)
  neo-kit.js             # escalado en pantalla (sin cambios)
  tools/
    build-tokens.mjs     # tokens.json → theme.css
    build-docs.mjs       # components.css → gallery + reference
    lint.mjs             # gate de validación headless
  tests/                 # visual regression + golden files
  .github/workflows/ci.yml
  SKILL.md  README.md  CONTRIBUTING.md  CHANGELOG.md  PLAN.md
  package.json
```

Build: `npx @tailwindcss/cli -i src/input.css -o dist/neo-ui.css --minify` (+ watch en
dev). **El mantenedor buildea; el agente nunca buildea** — solo linkea `dist/neo-ui.css`.

---

## 5 · Distribución y versionado

- **Semver** del artefacto. `CHANGELOG.md` (formato Keep a Changelog).
- `dist/neo-ui.css` publicado **versionado**: `neo-ui@1.2.0.css` + alias `latest`.
- neo-propuestas **pinnea versión** (`KIT_URL/neo-ui@1.2.0.css`) → un deck viejo nunca se
  rompe por un cambio de kit. `latest` solo para dev.
- Distribución: hosted URL versionado (Cloud Run / CDN) — encaja con MCP + skill. (npm
  opcional después.)

---

## 6 · Gate de calidad

### `lint.mjs` (headless, sobre el HTML del deck)

- cada `.slide` mide ≤ 1920×1080 y **no** tiene overflow
- scan de hex crudo → falla
- scan de arbitrary values (`class="…-[…]"`) → falla
- scan de utilidades fuera de la safelist → falla
- navy usado fuera de portada/divisor/cierre → falla
- heurística de datos inventados (métrica/nombre/precio que no matchee repo ni
  `[a completar a mano]`) → warning

### CI/CD

PR corre: `build` (falla si no compila) → `lint.mjs` → **visual regression** (screenshot
headless de `fixed/` + `gallery`, diff vs golden). Nada mergea si rompe el render.
Convierte la validación "a ojo" de hoy en gate mecánico.

---

## 7 · Reglas de marca (guardrails — heredadas, no romper)

1. **Solo tokens.** Colores vía `var(--<token>)` / `--client-color`. Cero hex crudo nuevo.
2. **Escala tipográfica fija.** Clases (`.hero/.h1/…`). No font-sizes sueltos.
3. **Canvas 1920×1080.** Nada desborda. Respeta el gutter (100px).
4. **Fondos navy solo** en portada, divisores y cierre (`.dark-bg`). Slides de datos = blanco.
5. **Sobre navy:** acentos en azul claro `--blue-light` o violeta, **nunca** `--blue`.
6. **Acento italic** PT Serif → `<em class="acc">`. Negritas solo 2–3 frases clave por slide.
7. **Español (es-PE).** Emoji 🚀 solo en líneas de "Logros" de casos de éxito.
8. **Tipografía:** títulos PT Serif Bold; cuerpo Montserrat.

---

## 8 · Roadmap por fases

Fases 0–3 = infra sin cambio visual (bajo riesgo). La calidad del output sube desde la
Fase 4. El trabajo "componente a componente" es la Fase 4.

| Fase | Qué | Riesgo |
|---|---|---|
| **0 — Fundación** | `git init`, scaffold, `package.json`. `tokens.json` + `build-tokens.mjs` → `theme.css`. safelist. Build Tailwind → `dist`. Verificar que buildea. | bajo, sin cambio visual |
| **1 — Paridad** | Migrar los ~15 componentes actuales a `@layer components` + `@apply`. Migrar `fixed/` + galería + assets. Deck UCIC = **mismo render (golden pixel)** antes de agregar nada. Retirar neo-deck (`DEPRECATED.md`). | bajo |
| **2 — Fuente única + docs** | `build-docs.mjs`. Cablear neo-propuestas a pinnear `dist`. Migrar brand narrative / assets. Retirar neo-design-system. | medio |
| **3 — Gate** | `lint.mjs` + CI (build + lint + visual regression). | bajo |
| **4 — Componentes nuevos** | Orden por frecuencia × riesgo (ver §9), **uno a la vez, revisado**. | incremental |
| **5 — Skill** | `SKILL.md` reescrito para la lib nueva (linkea `neo-ui.css`, vocabulario semántico + palette de utilidades). | bajo |
| **6 — (diferido)** | Export pptx/Gslides desde `tokens.json` + contenido (no HTML→pptx). | — |

### Retiro limpio de los proyectos absorbidos

No borrar de golpe: marcar neo-deck y neo-design-system con `DEPRECATED.md` → apuntando a
neo-ui, congelar, y borrar recién cuando neo-propuestas consuma neo-ui en producción.

---

## 9 · Componentes nuevos (Fase 4 — orden por frecuencia × riesgo)

Cada slide hoy "LIBRE" o `[a completar a mano]` que sea recurrente → convertir en
componente con forma fija. Menos composición libre = menos superficie de improvisación =
más consistencia.

| # | Componente | Estado hoy | Por qué |
|---|---|---|---|
| 1 | `.case-card` — caso de éxito (logo + métrica + reto/solución/resultado + 🚀 logro) | slot `[a completar a mano]` | **Máximo riesgo de alucinación.** Forma fija = el dato se rellena, nunca se inventa. |
| 2 | `.stats` — big numbers (¿Por qué NEO?, 25 años, N clientes) | free-compose | Recurrente. |
| 3 | `.logo-wall` — partners / clientes | free-compose | Recurrente. |
| 4 | `.milestones` — track record / hitos | free-compose | Recurrente. |
| 5 | `.clausulas` — términos, texto denso (2 slides) | free-compose | Recurrente. |
| 6 | `.team-card` — bio (foto placeholder + rol + nombre) | a mano | Estandariza el slide de equipo. |
| 7 | `.reto` — layout "necesidad del programa" | LIBRE | Da forma sin volverlo rígido. |
| 8 | Set de íconos | SVG a mano | Snippets reutilizables consistentes. |

**Regla al construir cada componente:** el dato duro (métrica, nombre, precio) **nunca** es
parte de la plantilla — la plantilla trae forma + placeholder; el dato solo se recupera del
repo o queda `[a completar a mano]`. Hereda la regla anti-alucinación del sistema.

---

## 10 · Decisiones abiertas (menores)

1. **Safelist exacta** — afinar la palette de spacing/grid permitida en Fase 0.
2. **neo-propuestas** — ¿referencia el catálogo generado o sirve `dist/neo-ui.css` desde
   `KIT_URL`? Decidir en Fase 2.
3. **Tokens semánticos de spacing** (`--spacing-gutter: 100px`) además del default de
   Tailwind — decidir en Fase 0.
4. **Target del exporter pptx** (Fase 6) — python-pptx offline vs Google Slides API.

---

## Referencias

- Kit actual: `../neo-deck/neo-kit.css`, `SKILL.md`, `EVOLUCION-KIT.md` (plan previo hacia
  Tailwind, base de este documento).
- Marca: `../neo-design-system/README.md`, `colors_and_type.css`, `SKILL.md`.
- Consumidor: `../neo-propuestas/PLAN.md` (flujo de propuestas, Fase 7 = maquetado).
</content>
</invoke>
