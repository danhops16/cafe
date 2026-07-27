# Immutable static site image.
# Clover sync and Vite build happen in CI before this Dockerfile runs.
# Never pass CLOVER_API_TOKEN (or any API secret) as ARG/ENV here.
FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
RUN rm -rf /usr/share/nginx/html/*
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx dist/ /usr/share/nginx/html/
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
