# syntax=docker/dockerfile:1
# Build SPA (Vite) rồi phục vụ bằng nginx. Build từ thư mục frontend.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
# Vite nhúng biến này vào bundle lúc build. Mặc định "/api": cùng domain, reverse proxy chuyển tới backend.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
