# # Build stage
# FROM node:20-alpine as build

# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies using npm
# RUN npm install

# # Copy source code
# COPY . .

# # Build the Astro application
# RUN npm run build

# # Production stage
# FROM node:20-alpine

# WORKDIR /app

# # Copy package files and built assets
# COPY --from=build /app/dist /app/dist
# COPY --from=build /app/package*.json ./

# # Install production dependencies only
# RUN npm install --omit=dev

# # Expose port 3000 (matches your astro.config.mjs port)
# EXPOSE 3000

# # Start the application
# CMD ["node", "./dist/server/entry.mjs"]


FROM node:lts AS runtime
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# ENV HOST=0.0.0.0
# ENV PORT=4321
EXPOSE 3000
CMD node ./dist/server/entry.mjs