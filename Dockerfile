# STAGE 1: Build the Next.js Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./
# set the API URL to trigger the rewrite proxy we just configured
ENV NEXT_PUBLIC_API_URL="/api"
RUN npm run build

# STAGE 2: Build the Final Runtime Monolith
FROM python:3.11-slim
WORKDIR /app

# Install Node.js (Required to run the standalone Next.js server) and Supervisor
RUN apt-get update && apt-get install -y curl supervisor && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Setup FastAPI Backend
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ ./backend/

# Setup Next.js Frontend (Copy the standalone compiled files)
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static/
COPY --from=frontend-builder /app/frontend/public ./frontend/public/

# Setup Process Manager
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENV HOSTNAME="0.0.0.0" \
    PORT=7860

EXPOSE 7860

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]