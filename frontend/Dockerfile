# Dockerfile
FROM node:20.18.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

# Install serve package globally
RUN npm install -g serve

# Use serve to run the production build
CMD ["serve", "-s", "build", "-l", "3001"]