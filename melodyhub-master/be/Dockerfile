# Use Node.js 18 alpine image for a smaller footprint
FROM node:18-alpine

# Install FFmpeg and build tools required by media processing dependencies
RUN apk add --no-cache ffmpeg python3 make g++

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --loglevel verbose

# Copy source code
COPY . .

# Expose backend port (adjust if your backend uses a different port)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
