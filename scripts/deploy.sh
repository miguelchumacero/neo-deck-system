#!/usr/bin/env bash
# Deploy de neo-ui (sitio estático: dist/ + assets/ + reference/ + tokens/) a Cloud Run.
# Build de la imagen en Cloud Build vía Dockerfile. El CSS se compila ACÁ antes de subir:
# la imagen solo sirve el artefacto.
#
# Uso: ./scripts/deploy.sh
set -euo pipefail

PROJECT="${NEO_GCP_PROJECT:-brain-clientes}"
REGION="${NEO_GCP_REGION:-us-central1}"
SERVICE="${NEO_SERVICE:-neo-ui}"

cd "$(dirname "$0")/.."

VERSION="$(node -p "require('./package.json').version")"

echo "==> Build del CSS (tokens → theme → dist/neo-ui.css) + catálogo"
npm run build
npm run docs

# Copia pinneada por versión: un deck viejo linkea neo-ui@<version>.css y nunca se rompe
# por un cambio del kit. dist/neo-ui.css queda como alias `latest` (solo para dev).
# Las copias pinneadas SÍ se versionan en git: la imagen sirve todas las versiones pasadas,
# así que subir de versión no deja en 404 a los decks ya emitidos. Commitea la copia nueva.
echo "==> Copia pinneada: dist/neo-ui@${VERSION}.css"
cp dist/neo-ui.css "dist/neo-ui@${VERSION}.css"
if [[ -n "$(git status --porcelain "dist/neo-ui@${VERSION}.css" 2>/dev/null)" ]]; then
  echo "    OJO: dist/neo-ui@${VERSION}.css cambió o es nuevo → commitealo tras el deploy."
fi

gcloud run deploy "$SERVICE" \
  --source . \
  --project "$PROJECT" \
  --region "$REGION" \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 256Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 60 \
  --port 8080 \
  --quiet

URL="$(gcloud run services describe "$SERVICE" \
  --project "$PROJECT" --region "$REGION" \
  --format="value(status.url)")"

echo
echo "URL del servicio: $URL"
echo "CSS pinneado:     $URL/dist/neo-ui@${VERSION}.css"
echo "CSS latest (dev): $URL/dist/neo-ui.css"
echo "Catálogo:         $URL/reference/gallery.html"
