# syntax=docker/dockerfile:1
# Build SPA (Vite) rồi phục vụ bằng nginx. Build từ thư mục frontend.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
# Vite nhúng biến này vào bundle lúc build. Mặc định "/api": cùng domain, reverse proxy chuyển tới backend.
ARG VITE_API_BASE_URL=/api
ARG VITE_CONTACT_EMAIL=
ARG VITE_CONTACT_PHONE=
ARG VITE_CONTACT_ADDRESS=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL \
    VITE_CONTACT_PHONE=$VITE_CONTACT_PHONE \
    VITE_CONTACT_ADDRESS=$VITE_CONTACT_ADDRESS
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
