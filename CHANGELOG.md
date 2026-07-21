# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Added — Fase 1 · Paridad (en curso)
- `tokens.json` — grupo `alias` (portado del neo-design-system, acotado a slides):
  `stage`, `fg3`, `fg-on-dark`, `fg-faint-on-dark`, `border-on-dark`. Emiten solo
  `var(--x)` en `:root`, sin utilidades `bg-*`/`text-*`.
- `primitives.css` — hex/rgba crudo (`#0b0b1a`, `rgba(255,255,255,.75/.6)`) tokenizado
  con los alias de arriba. Mismos valores, cero cambio visual.
- Trío de marca navy (§7.4) completo en `components.css` + `reference/gallery.html`:
  - `.cover` — portada NEO (marca, dark).
  - `.proposal-cover` — portada de propuesta con cliente (fondo claro, split 2 cols).
    Nombre distinto de `.cover` a propósito: familia visual distinta, no variante.
  - `.divider` — divisor de sección (formato nuevo: logo + título centrado + url).
  - `.closing` — cierre (logo + tagline + `.socials`).
- Refactor DRY: `@utility dark-surface` (Tailwind v4, en `primitives.css`) — fondo
  navy+puntos compartido por `.slide.dark-bg` + los 3 componentes dark. Factorizado
  recién con las 3 muestras completas (no antes, para no abstraer con 1-2 casos).
  Reglas compiladas verificadas idénticas antes/después.

### Added — Fase 0 · Fundación
- Scaffold del repo (`git init`, `package.json`, estructura de carpetas).
- `tokens/tokens.json` — fuente única W3C Design Tokens (color, tipografía, escala de
  texto, espacio, radii, canvas).
- `tools/build-tokens.mjs` — deriva `src/theme.css` (@theme).
- `src/theme.css` (generado) con el **cierre**: `--color-*/--text-*/--font-* : initial`
  → solo tokens NEO generan utilidades. Aliases cortos `var(--navy)` para autoría.
- `src/primitives.css` — `.slide` (canvas 1920×1080), tipografía, cromo, `@font-face`.
- `src/components.css` — starter (`.card`, `.pill`, `.client-panel`) + convención de doc.
- `src/input.css` + safelist vía `@source inline` (layout curado) · `safelist.txt` (doc).
- Assets migrados: fonts (PT Serif, Montserrat), logos, background de puntos.
- `dist/neo-ui.css` — build Tailwind v4 verificado.
- `reference/gallery.html` — seed de styleguide con las 2 portadas reales del kit
  (portada-neo marca + portada-propuesta cliente) + showcase de componentes. Render
  verificado en Chrome.
- Docs: `README.md`, `CONTRIBUTING.md`, este `CHANGELOG.md`.

### Pendiente
- Fase 1 · Paridad: migrar el resto de componentes del kit actual (proc-card, agenda,
  cron, temario, timeline, notes...) + resto de `fixed/`, golden pixel vs deck UCIC.
- Fase 2 · `build-docs.mjs` (galería generada) + cablear neo-propuestas.
- Fase 3 · `lint.mjs` + CI (build + lint + visual regression).
