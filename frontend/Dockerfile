# ---- Build Stage ----
FROM oven/bun:1 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Vite project
RUN bun run build


# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

# Install lightweight static server
RUN npm install -g serve

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start production server
CMD ["serve", "-s", "dist", "-l", "3000"]
