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
- `.agenda` — slide de agenda: split 36/64 (panel navy `dark-surface` + lista
  numerada `.agenda-list`/`.agenda-item`), porteado 1:1 del kit. Verificado golden-pixel.
- `.clients` — slide "Nuestros Clientes" (track record): fondo navy + grid 3×2 de
  sectores (`.client-sector` + `.client-logos`). 38 logos reales (blancos monocromo)
  portados de `samples/…SPSA.pptx` (slide39) a `assets/logos/clients/`, mapeados por
  posición y verificados en navegador contra la referencia. Logos con alpha-boost
  (gamma 0.6) para que el blanco de bordes finos no se apague sobre el navy; panel
  `.client-sector` con superficie levemente más clara (`rgba(255,255,255,.055)`).
  Fix texto claro-sobre-oscuro: `.clients` aplica `dark-surface` (utility) pero NO la
  clase `.dark`/`.dark-bg`, así que los overrides `.dark-bg .eyebrow`/`.muted` de
  primitives no matcheaban → eyebrow/subtítulo salían en color oscuro (invisibles).
  Añadido `.clients` a esos selectores en `primitives.css`.
- `.socials` (cierre) — íconos rediseñados como badge blanco + glifo navy
  (`.social-badge-bg`/`-fg`), salvo Instagram que es solo contorno blanco
  (`.social-outline`). Corregido desde una referencia explícita de Miguel (el kit
  viejo tenía paths sólidos sin badge).
- `.why-neo` — slide intro de sección "¿Por qué NEO?" (portado de slide37). NUEVA
  superficie oscura: navy con **gradiente** radial (glow azul arriba-izq → base
  `#19213D`), distinta de `dark-surface` (puntos). Título `.h1` con acento italic
  blue-light, bajada `.muted`, y `.why-neo-kpis` (grid 4 col de `.why-neo-kpi`:
  número `.kpi-num` blue-light + `.kpi-label`) con reglas divisoras. Overrides de
  texto claro-sobre-oscuro: añadido `.why-neo` a `.eyebrow`/`.muted`/`em.acc` en
  primitives (mismo patrón que `.clients`).
- `.partners` — slide "Nuestros partners" / ecosistema (portado de slide38). Fondo
  claro (`--lila`). Header + body 2 col (`.partners-body`): izq grid 2×2 de
  `.partner-card` (tiles claros con logo a color), der `.partners-cert` (panel navy
  + `.cert-badge` círculo blanco con sello B Corp). 5 logos a color en
  `assets/logos/partners/`.
- `.clauses` — slides de términos legales densos (portadas de slide34 Cláusulas
  generales / slide35 Facturación por retrasos y pausas). Fondo claro, título `.h2`
  con barra-acento azul (`.clauses-title`), cuerpo `.clause-list`: `.clause-head`
  (subtítulo bold sin viñeta) + `.clause-item` (viñeta azul, lead-in en `<strong>`).
  Variante 2 columnas vía `.clauses-cols`.
- `reference/gallery.html` — divisor de sección reutilizado (`.divider` con texto
  "¿Por qué NEO?"); orden de slides alineado al deck real de `samples/` (se está
  portando de atrás hacia delante).

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
