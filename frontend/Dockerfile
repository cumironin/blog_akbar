# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Development server stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and built assets
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies
RUN npm install -g serve

# Expose port 3001 (matching the port in main nginx config)
EXPOSE 3001

# Start the server
CMD ["serve", "-s", "dist", "-l", "3001"]
