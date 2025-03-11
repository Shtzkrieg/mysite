# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# Expose ports
EXPOSE 3002
EXPOSE 4173

# Set environment variables
ENV HOST=0.0.0.0
ENV API_PORT=3002
ENV PORT=4173
ENV NODE_ENV=production

# Verify Prisma can access the schema
RUN bunx prisma generate

# Start the application
CMD ["bun", "run", "serve"]