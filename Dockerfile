# ---------- Stage 1: Build Angular ----------
FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./

RUN pnpm install
COPY . .

RUN pnpm ng build --configuration production

# ---------- Stage 2: Servir estático con Nginx ----------
FROM nginx:1.27-alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/*/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
