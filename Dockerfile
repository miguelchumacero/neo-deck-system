# neo-ui — design system de slides servido como sitio estático.
# nginx unprivileged: corre como uid 101 (no-root) y escucha en 8080 → encaja con Cloud Run.
# El CSS ya viene precompilado en dist/ (el mantenedor buildea con `npm run build`);
# la imagen NO buildea Tailwind: solo sirve el artefacto.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Config del server (puerto, CORS, MIME de fuentes, cache).
COPY default.conf /etc/nginx/conf.d/default.conf

# Solo lo que se sirve (COPY explícito: nada de src/, tools/, node_modules ni .git en el webroot).
WORKDIR /usr/share/nginx/html
COPY index.html ./
COPY dist/      ./dist/
COPY assets/    ./assets/
COPY reference/ ./reference/
COPY tokens/    ./tokens/

EXPOSE 8080
