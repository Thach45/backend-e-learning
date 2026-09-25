FROM node:18-alpine

WORKDIR /app

# Copy file package trước để tối ưu cache
COPY package*.json ./

RUN npm install

# Copy toàn bộ source
COPY . .


# Expose port NestJS (thường là 3000)
EXPOSE 3000

# Chạy app ở mode production
CMD ["npm", "run", "start:dev"]