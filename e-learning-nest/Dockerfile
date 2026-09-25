# syntax=docker/dockerfile:1
# Image production cho NestJS. Build từ thư mục e-learning-nest (xem docker-compose.yml ở gốc repo).

FROM node:20-bookworm-slim AS build
WORKDIR /app
# Prisma cần openssl để tải/chạy query engine
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build && test -f dist/main.js


FROM node:20-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
# Giữ mã nguồn + công cụ dev để chạy `prisma db push` và các script seed (ts-node) ngay trong container
COPY --from=build /app/src ./src
COPY --from=build /app/initialScript ./initialScript
COPY --from=build /app/tsconfig.json /app/tsconfig.build.json /app/nest-cli.json ./

# AppLogger ghi file vào logs/
RUN mkdir -p logs && chown -R node:node logs
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
