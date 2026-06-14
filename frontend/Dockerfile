# Stage 1: Base image
FROM node:22-alpine AS base

# Stage 2: Install dependencies
FROM base AS deps
# libc6-compat is required by some Node packages (like Prisma or Next.js image optimization) on Alpine Linux
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm install

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry data collection
ENV NEXT_TELEMETRY_DISABLED 1

# Run the build process
RUN npm run build

# Stage 4: Production server environment
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security (best practice for production)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public directory
COPY --from=builder /app/public ./public

# Set correct permissions for the cache directory
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the standalone server
CMD ["node", "server.js"]