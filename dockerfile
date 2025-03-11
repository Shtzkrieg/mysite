# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lock
COPY package.json bun.lock /app/

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN bun install

# Build the application
RUN bun run build

# Expose the port that Vite will run on
EXPOSE 4173

# Set host environment variable
ENV HOST=0.0.0.0

# Start the application
CMD ["bun", "run", "serve"]