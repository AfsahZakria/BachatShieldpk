# Dockerfile for BachatShield (Full-stack Monolith)
FROM node:20-alpine

WORKDIR /app

# Copy server package definitions
COPY server/package*.json ./server/

# Install dependencies
RUN cd server && npm install --production

# Copy server and client source files
COPY server/ ./server/
COPY client/ ./client/

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "server/server.js"]
