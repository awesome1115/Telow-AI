# Build stage
FROM node:20.10.0 AS builder

WORKDIR /app
COPY . /app

RUN yarn install

RUN yarn build

# Serve stage
FROM nginx:alpine

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to the Docker host, so we can access it
# from the outside.
EXPOSE 80
