# syntax=docker/dockerfile:1

############################################
# Build stage: compile Vite React frontend  #
############################################
FROM oven/bun:1 AS build

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json bun.lock* ./
RUN bun install

# Copy source
COPY . .

# Allow passing API base at build-time for Vite (optional)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build static assets
RUN bun run build

############################################
# Runtime stage: serve with Bun             #
############################################
FROM oven/bun:1 AS runtime

WORKDIR /app

# Copy built assets and server
COPY --from=build /app/dist ./dist
COPY server.ts ./server.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["bun", "run", "server.ts"]
