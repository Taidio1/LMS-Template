# Production ready Dockerfile for Backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create uploads directory if it doesn't exist (for persistence)
RUN mkdir -p uploads

# Expose API port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
