# Stage 1: Build the Vite app
FROM node:20-alpine AS builder

WORKDIR /app

# Declare build-time arguments (passed via --build-arg)
ARG VITE_SERVER_URL
ARG VITE_HOME_PATH
ARG VITE_CASHFREE_MODE
ARG VITE_PUBLIC_FIREBASE_API_KEY
ARG VITE_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG VITE_PUBLIC_FIREBASE_PROJECT_ID
ARG VITE_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_PUBLIC_FIREBASE_APP_ID
ARG VITE_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG VITE_GOOGLE_CLIENT_ID

# Make them available as ENV during build (Vite reads ENV vars prefixed with VITE_)
ENV VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_HOME_PATH=$VITE_HOME_PATH \
    VITE_CASHFREE_MODE=$VITE_CASHFREE_MODE \
    VITE_PUBLIC_FIREBASE_API_KEY=$VITE_PUBLIC_FIREBASE_API_KEY \
    VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=$VITE_PUBLIC_FIREBASE_AUTH_DOMAIN \
    VITE_PUBLIC_FIREBASE_PROJECT_ID=$VITE_PUBLIC_FIREBASE_PROJECT_ID \
    VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=$VITE_PUBLIC_FIREBASE_STORAGE_BUCKET \
    VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    VITE_PUBLIC_FIREBASE_APP_ID=$VITE_PUBLIC_FIREBASE_APP_ID \
    VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=$VITE_PUBLIC_FIREBASE_MEASUREMENT_ID \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --legacy-peer-deps  # or npm install; use ci for exact lockfile reproducibility in CI

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production image - lightweight Nginx
FROM nginx:alpine

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Custom nginx.conf if needed (e.g. for SPA routing)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (informational; -p still required at runtime)
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]