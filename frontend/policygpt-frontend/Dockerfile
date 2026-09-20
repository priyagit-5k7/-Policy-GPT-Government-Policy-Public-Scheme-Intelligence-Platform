# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Only copy package files first for dependency caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build for production
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from builder stage
COPY --from=builder /usr/src/app/dist/policygpt-frontend/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD sh -c "sed -i -e 's/listen 80;/listen '\"${PORT:-80}\"';/g' -e 's|http://backend:8000|'\"${BACKEND_URL:-http://backend:8000}\"'|g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
