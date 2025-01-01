# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build with production environment
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration files
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000 (as specified in docker-compose.yml)
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]