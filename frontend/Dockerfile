# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3001

# Start with node using a simple static server
RUN npm install -g http-server

# Use http-server instead of serve
CMD ["http-server", "dist", "-p", "3001", "--cors"]