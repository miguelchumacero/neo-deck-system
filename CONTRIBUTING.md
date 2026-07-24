# Contributing — neo-ui

## Regla de oro: fuente única

`tokens/tokens.json` es la **única** autoridad de color/tipo/espacio/radii. Nunca
hardcodees un hex, font-size o radio en CSS. Cambia el token → `npm run tokens` →
propaga a `theme.css` y docs.

**Nunca edites archivos generados:** `src/theme.css` (de `tokens.json`) y
`reference/gallery.html` (de `components.css`). `reference/template.html` sí es a mano.

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

## Tratamientos compartidos entre componentes

Si un mismo bloque de CSS (fondo, superficie, cromo) se repite en **3 o más** componentes,
factorízalo con `@utility` de Tailwind v4 en `primitives.css` y consúmelo con `@apply` desde
cada componente. Ejemplo: `.cover`, `.divider`, `.closing` y `.slide.dark-bg` comparten el
fondo navy + patrón de puntos vía `@utility dark-surface`.

No factorices con 1–2 muestras — esperá a tener el patrón real (3+ casos) antes de abstraer;
con pocos casos es fácil elegir mal la forma de la abstracción.

## Texto claro sobre superficie oscura

Los overrides de color claro para texto sobre navy (`.eyebrow` → blue-light, `.muted` →
fg-on-dark, `em.acc` → blue-light) en `primitives.css` están atados a las clases `.dark` /
`.dark-bg`. Un componente con superficie oscura **propia** (que aplica `@utility dark-surface`
o un gradiente, pero NO la clase `.dark`/`.dark-bg`) **no hereda** esos overrides → eyebrow /
subtítulo salen en su color oscuro default e invisibles.

Fix: agregá el nombre del componente a esos selectores en `primitives.css`
(`.dark .eyebrow, .dark-bg .eyebrow, .clients .eyebrow, .why-neo .eyebrow { … }`). Ya aplicado
para `.clients` y `.why-neo`; repetí para cada nuevo componente oscuro sin clase `.dark`.

## Portar del deck real (no inventar)

Los slides se portan del deck de producción en `samples/` (`.pptx`), no se inventan. Técnica:
el `.pptx` es un zip → `unzip ppt/media/` para los assets, parsear `ppt/slides/slideN.xml`
(posiciones EMU `<a:off>`/`<a:ext>`, dividir por **9525** para px sobre canvas 1920×1080;
tamaños de fuente en pt × 1.333 ≈ px) + `slideN.xml.rels` (rId → imagen). Verificá el render
en Chrome contra el slide real antes de dar por cerrado (regla anti-alucinación, `PLAN.md §9`).

## Layout / utilidades

Solo el subset en `safelist.txt` (espejo de `@source inline` en `src/input.css`). Si
necesitas una utilidad nueva, agrégala en **ambos** sitios. Arbitrary values
(`p-[37px]`, `grid-cols-[5]`) están prohibidos — no se emiten y el linter los caza.

## Antes de commitear

```bash
npm run build   # debe compilar sin error
npm run docs    # regenera el catálogo si tocaste components.css
npm run lint    # gate headless — OJO: tools/lint.mjs aún no existe (Fase 3)
```

Chequeo de overflow mientras no exista el gate: renderizá headless y medí cada `.slide`
forzando `overflow:visible` antes de medir `scrollHeight` — el `overflow:hidden` de `.slide`
enmascara el desborde. Validá el arnés con una slide de control que sí desborde.

## Publicar (servir el kit)

```bash
./scripts/deploy.sh     # build + docs + pin de versión + deploy a Cloud Run (servicio neo-ui)
```

El consumidor (`neo-propuestas`, resource `neo://maquetado`) linkea la **URL pinneada**
`/dist/neo-ui@<version>.css`. Si el cambio rompe compatibilidad visual de decks ya emitidos,
subí la versión en `package.json` **antes** de desplegar: la copia pinneada vieja seguirá
sirviéndose sólo si la imagen la contiene, así que un deck viejo se re-pinnea o se re-maqueta.
`dist/neo-ui.css` (alias latest) es sólo para dev.

Versionado: semver del artefacto, `CHANGELOG.md` formato Keep a Changelog.
