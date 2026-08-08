# ICON-INSTITUTE website + CMS admin — production image.
#
# Stage 1 builds the static site; stage 2 serves it with nginx configured for
# single-page-app routing, so deep links like /news and /admin/login resolve
# instead of returning 404.
#
#   docker build --build-arg VITE_API_BASE_URL=https://api.example/api/v1 -t icon-site .
#   docker run -p 8080:80 icon-site

# ── build ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines env vars at build time, so the API URL must be supplied here.
# Defaults to the deployed API; override per environment with --build-arg.
ARG VITE_API_BASE_URL=https://iconinstitue.api.dev.codexcape.solutions/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── serve ────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
