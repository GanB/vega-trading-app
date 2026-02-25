FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_tokens off; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
        add_header X-Content-Type-Options "nosniff"; \
        add_header X-Frame-Options "DENY"; \
        add_header Referrer-Policy "strict-origin-when-cross-origin"; \
    } \
    location /api/ { \
        proxy_pass http://api:8000; \
        client_max_body_size 1m; \
    } \
    location /ws/ { \
        proxy_pass http://api:8000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
