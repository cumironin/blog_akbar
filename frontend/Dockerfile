# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Serve stage
FROM node:20-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built files
COPY --from=build /app/dist ./dist

# Expose port 3001
EXPOSE 3001

# Start the server
CMD ["serve", "-s", "dist", "-l", "3001"]
