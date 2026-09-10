# ---- Build stage ----
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
# Defaults for local compose; Railway overrides PORT (+API_URL) at runtime.
ENV PORT=80 API_URL=""
EXPOSE 80
# Preprocess only $PORT/$API_URL (envsubst with explicit list keeps $host etc. intact),
# so the same image runs on compose (80, same-origin) and Railway ($PORT, remote API).
CMD ["sh", "-c", "envsubst '$PORT $API_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
