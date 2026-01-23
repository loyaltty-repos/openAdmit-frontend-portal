# Build Stage
FROM node:20 AS build

# Build Stage
FROM node:20 AS build

ARG VITE_PUBLIC_FIREBASE_API_KEY
ARG VITE_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG VITE_PUBLIC_FIREBASE_PROJECT_ID
ARG VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG VITE_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG VITE_PUBLIC_FIREBASE_APP_ID
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_SERVER_URL

ENV VITE_PUBLIC_FIREBASE_API_KEY=$VITE_PUBLIC_FIREBASE_API_KEY
ENV VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=$VITE_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV VITE_PUBLIC_FIREBASE_PROJECT_ID=$VITE_PUBLIC_FIREBASE_PROJECT_ID
ENV VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=$VITE_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=$VITE_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV VITE_PUBLIC_FIREBASE_APP_ID=$VITE_PUBLIC_FIREBASE_APP_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_SERVER_URL=$VITE_SERVER_URL

WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


# Set the working directory for the build stage
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force


# Copy all the source code
COPY . .

# Build the app for production
RUN npm run build

# Production Stage
FROM nginx:stable-alpine AS production

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
# Expose the port the app will run on
EXPOSE 80

# Start Nginx to serve the production build
CMD ["nginx", "-g", "daemon off;"]