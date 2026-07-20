# Contributing — neo-ui

## Regla de oro: fuente única

`tokens/tokens.json` es la **única** autoridad de color/tipo/espacio/radii. Nunca
hardcodees un hex, font-size o radio en CSS. Cambia el token → `npm run tokens` →
propaga a `theme.css` y docs.

**Nunca edites archivos generados:** `src/theme.css`, y `reference/gallery.html`
(cuando pase a generado en Fase 2).

## Convención de nombres

Semántico, **kebab-case**, sin abreviaturas crípticas:

- ✅ `.case-card`, `.stage-block`, `.logo-wall`, `.milestones`
- ❌ `.cc`, `.sb`, `.lw`

El nombre describe **qué es** (rol), no cómo se ve. Un componente nunca lleva el dato
duro en la plantilla — trae forma + placeholder (regla anti-alucinación, `PLAN.md §9`).

## Capas (dependencia hacia abajo, nunca hacia arriba)

```
theme (tokens) → primitives → components → patterns
```

Un componente usa `var(--<token>)` (p.ej. `var(--navy)`); nunca redefine un token ni sube de capa.

## Agregar un componente

1. Escríbelo en `src/components.css` dentro de `@layer components`.
2. Documenta con la convención (la parsea `build-docs.mjs`):
   ```css
   /* @component .nombre — descripción corta
      @example
      <article class="nombre">…</article> */
   ```
3. Usa solo tokens y utilidades safelisteadas. Cero hex crudo, cero arbitrary values.
4. `npm run build` → verifica en `reference/gallery.html`.

Agregar un componente = **un solo sitio**. Aparece en galería + reference sin doble edición.

## Layout / utilidades

Solo el subset en `safelist.txt` (espejo de `@source inline` en `src/input.css`). Si
necesitas una utilidad nueva, agrégala en **ambos** sitios. Arbitrary values
(`p-[37px]`, `grid-cols-[5]`) están prohibidos — no se emiten y el linter los caza.

## Antes de commitear

```bash
npm run build   # debe compilar sin error
npm run lint    # gate headless (Fase 3+)
```

Versionado: semver del artefacto, `CHANGELOG.md` formato Keep a Changelog.
