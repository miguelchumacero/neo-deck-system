# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Added — Despliegue (servir el kit) + paridad de componentes de contenido
- **neo-ui se sirve como sitio estático en Cloud Run** (servicio `neo-ui`, proyecto
  `brain-clientes`/`us-central1`). Un deck linkea el CSS por URL, sin build ni Skill que
  instalar por máquina. Infra: `Dockerfile` (nginx-unprivileged, uid 101, puerto 8080,
  COPY explícito del webroot: `index.html` + `dist/` + `assets/` + `reference/` + `tokens/`),
  `default.conf` (CORS `*` — **obligatorio**: sin `Access-Control-Allow-Origin` el navegador
  rechaza las `@font-face` cross-origin —, MIME `font/ttf`, gzip, cache: 1 año inmutable para
  el CSS pinneado, 7d imágenes, 5min alias/HTML, `nosniff`), `index.html` (landing),
  `.dockerignore`, `.gcloudignore`, `scripts/deploy.sh`.
- **CSS pinneado por versión**: `deploy.sh` buildea, genera el catálogo y copia
  `dist/neo-ui.css` → `dist/neo-ui@<version>.css` antes de subir. El consumidor pinnea
  (`/dist/neo-ui@0.1.0.css`) y un deck viejo no se rompe cuando el kit avanza;
  `dist/neo-ui.css` queda como alias `latest` para dev. **Las copias pinneadas se versionan
  en git**: así la imagen sirve también las versiones pasadas y subir de versión no deja en
  404 a los decks ya emitidos (si fueran derivadas por deploy, la vieja desaparecía).
  `.gcloudignore` es explícito a propósito: sin él gcloud deriva uno de `.gitignore` y lo
  ignorado ahí quedaría fuera de la imagen sin aviso.
- **Componentes de contenido portados del kit viejo** (cierran la paridad que el flujo de
  propuestas necesitaba para maquetar de punta a punta):
  - `.proc-card` — card de borde punteado (paso de proceso / slot `[a completar a mano]`).
  - `.stage-block` + `.stage-label` + `.entregable-card` — etapa del proceso (tríada
    BENEFICIOS / NECESITAMOS DEL CLIENTE / ENTREGABLE).
  - `.cron` + `.notes` — tabla de cronograma e inversión (`td.stage`/`td.on`/`td.price`).
  - `.temario-row` + `.temario-card` (+ `.ast`) + `.temario-note` — sílabo por sesión.
  - `.proc-cols` + `.tl` — proceso en 4 columnas con línea de tiempo y nodos.
  No es un port verbatim: los tamaños se re-mapearon a la escala tokenizada (piso de 20pt),
  los hex crudos salieron a tokens (`--card-soft`, `--node-ring`, alias nuevos) y los SVG de
  íconos usan `currentColor` (`.proc-cols .ico` lleva el color). Verificado headless: los 12
  ejemplos de slide completa miden ≤1920×1080 sin overflow (medido con `overflow:visible`
  forzado, porque el `overflow:hidden` de `.slide` enmascara el desborde; el arnés se validó
  con una slide de control que sí desborda).
- `tokens.json`: alias `card-soft` (#EAE7F8) y `node-ring` (#E7E7F4); `text.legal` documenta
  que también cubre `.notes` y las sub-líneas de `.cron`.

### Added — Fase 2 · Fuente única + docs (en curso)
- `reference/template.html` — **plantilla base de propuesta** (deck armado en orden
  real que toda propuesta clona). Es contenido authored a mano — NO se genera. Antes
  vivía en `gallery.html`; se separó al introducir el catálogo generado para no
  aplastarla. `gallery.html` pasa a ser el **catálogo de componentes** (generado).
- `tools/build-docs.mjs` (`npm run docs`) — genera `reference/gallery.html` (catálogo
  de componentes) desde la fuente única `src/components.css` (parse de `@component`/
  `@example` co-ubicados). Fragmentos (`.card`/`.pill`/`.socials`…) se muestran en un
  `.frag` auto-height; los `@example` que ya son `<section>` usan el canvas 1080.
  Un componente nuevo = un solo sitio (`components.css`) → aparece en el catálogo sin
  doble edición. Orden = orden de aparición en `components.css`. Cada specimen: nombre
  + descripción + preview + fuente HTML en `<details>`.
- Convención `@preview <clases>` (opcional) en el comentario de un componente: clases
  extra para el `<section>` wrapper del preview. Añadido `@preview dark-bg` a `.socials`
  (fragmento que necesita fondo navy para verse).

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

### Changed
- Escala tipográfica: **piso duro de 20pt** (≈27px). Subidos `body` 21→32px,
  `lead` 28→36, `callout` 34→40, `body-sm` 18→29, `eyebrow` 15→27. Nuevo token
  `text.legal` (21px, ≈15.75pt) como **excepción documentada** al piso — solo para
  `.clauses` (`.clause-head`/`.clause-item`), cuyo texto legal denso no entra en el
  canvas fijo 1920×1080 si sube al piso general. `theme.css` + `dist` regenerados.
- Tokenizados todos los `font-size` hardcoded de `components.css`/`primitives.css`
  a utilidades `--text-*` (client-panel, cover-site, closing-site, client-sector-label,
  partners-label, kpi-label, clause-*, pill, cobrand, footer-meta). Los px que quedan
  (cover-tagline 40, agenda 96/40/30, kpi-num 104…) son display sizes deliberados
  ≥28px, sobre el piso.

### Removed
- Footer de paginación ("Slide 4") en `reference/gallery.html`. Los slides del deck NEO
  **no llevan número de página** (decisión de marca). `.footer-meta` (primitive) se
  mantiene para meta libre — no es contador de página.

### Fixed
- Franja horizontal clara en el filo inferior de los slides de fondo oscuro
  (`.cover`/`.divider`/`.closing`/`.clients`, que comparten `dark-surface`). Causa: el
  asset `assets/backgrounds/section-divider-dots.png` traía **bordes sucios horneados**
  (fila gris arriba + tira gris/casi-blanca de 2px abajo) que con `background-size: cover`
  caían en el borde del slide. Fix: recorte del PNG `1294×732` → `1294×727` (bordes
  ahora dots navy limpios; ratio 1.779 ≈ slide 1.778). El render a 1920×1080 nativo
  quedó verificado limpio; sin cambios de CSS.

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
