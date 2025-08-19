# ---- Build Stage ----
FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files first
COPY package.json bun.lockb* ./

# Install deps (both dev + prod so build works)
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build to ./build
RUN bun run build


# ---- Runtime Stage ----
FROM oven/bun:1

WORKDIR /app

# Copy only what we need: built code + static + package files + lockfile
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/static ./static

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Expose app port
EXPOSE 3000

# Run server
CMD ["bun", "run", "start"]
