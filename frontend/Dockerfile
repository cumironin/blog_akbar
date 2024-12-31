# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use npm install
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - just the static files
FROM node:20-alpine

WORKDIR /app

# Copy built assets
COPY --from=build /app/dist /app/dist

# Install serve
RUN npm install -g serve

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]