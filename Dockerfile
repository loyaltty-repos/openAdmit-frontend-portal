# -----------------------------
# Stage 1: Build
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# ---- Build Arguments (from GitHub Secrets) ----
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

# ---- Inject into ENV for build ----
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_HOME_PATH=$VITE_HOME_PATH
ENV VITE_CASHFREE_MODE=$VITE_CASHFREE_MODE
ENV VITE_PUBLIC_FIREBASE_API_KEY=$VITE_PUBLIC_FIREBASE_API_KEY
ENV VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=$VITE_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV VITE_PUBLIC_FIREBASE_PROJECT_ID=$VITE_PUBLIC_FIREBASE_PROJECT_ID
ENV VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=$VITE_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_PUBLIC_FIREBASE_APP_ID=$VITE_PUBLIC_FIREBASE_APP_ID
ENV VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=$VITE_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the project
RUN npm run build


# -----------------------------
# Stage 2: Serve with Nginx
# -----------------------------
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: SPA routing support (important)
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    }\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]