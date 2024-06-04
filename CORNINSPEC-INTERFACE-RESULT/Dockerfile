# Specify the base image from the official Node.js repository
FROM node:18-alpine
WORKDIR /app

# Update system packages and install curl
RUN apk update && \
    apk add --no-cache curl

# Copy package.json and yarn.lock to leverage Docker caching
COPY package*.json ./
COPY yarn.lock .

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy the rest of your application source code
COPY . .

# Make sure to copy the .env file if it's not meant to be in the .dockerignore
# COPY ../.env ./

# Set permissions for non-root user 'node' and switch to it
RUN chown -R node:node /app
USER node

# Expose the port your app runs on
EXPOSE 8009

# Define the command to run your app
CMD ["node", "src/app.js"]