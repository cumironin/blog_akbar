# Use the latest LTS Node.js Alpine image as a base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json (no need for pnpm-lock.yaml)
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
