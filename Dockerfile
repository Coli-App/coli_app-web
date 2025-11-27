# ---------- Stage 1: Build Angular ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install
COPY . .


RUN npx ng build --configuration production

# ---------- Stage 2: Servir estáticos con Nginx ----------
FROM nginx:1.27-alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/*/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
