# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Added — Fase 0 · Fundación
- Scaffold del repo (`git init`, `package.json`, estructura de carpetas).
- `tokens/tokens.json` — fuente única W3C Design Tokens (color, tipografía, escala de
  texto, espacio, radii, canvas).
- `tools/build-tokens.mjs` — deriva `src/theme.css` (@theme) y `tokens/tokens.pptx.json`.
- `src/theme.css` (generado) con el **cierre**: `--color-*/--text-*/--font-* : initial`
  → solo tokens NEO generan utilidades. Aliases legacy `var(--neo-*)` para autoría.
- `src/primitives.css` — `.slide` (canvas 1920×1080), tipografía, cromo, `@font-face`.
- `src/components.css` — starter (`.card`, `.pill`) + convención de doc para galería.
- `src/input.css` + safelist vía `@source inline` (layout curado) · `safelist.txt` (doc).
- Assets migrados: fonts (PT Serif, Montserrat), logos, background de puntos.
- `dist/neo-ui.css` — build Tailwind v4 verificado.
- `referencia/galeria.html` — seed de styleguide (render verificado en Chrome).
- Docs: `README.md`, `CONTRIBUTING.md`, este `CHANGELOG.md`.

### Pendiente
- Fase 1 · Paridad: migrar los ~15 componentes del kit actual + `fijos/` (golden pixel).
- Fase 2 · `build-docs.mjs` (galería generada) + cablear neo-propuestas.
- Fase 3 · `lint.mjs` + CI (build + lint + visual regression).
