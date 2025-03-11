# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock ./

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client (without accessing DB)
RUN bunx prisma generate

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# Expose the port that Vite will run on
EXPOSE 4173
# Expose the API port
EXPOSE 3002

# Set host environment variable
ENV HOST=0.0.0.0

# Start the application
CMD ["bun", "run", "serve"]