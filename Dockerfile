# ===================================================
# Stage 1: Build Frontend (Vite + React SPA)
# ===================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source and build
COPY . .
RUN npm run build

# ===================================================
# Stage 2: Production Python Runtime with Gunicorn
# ===================================================
FROM python:3.11-slim AS runner
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Copy compiled frontend assets from Stage 1 into dist/
COPY --from=frontend-builder /app/dist ./dist

# Set environment defaults
ENV PORT=5000 \
    FLASK_ENV=production \
    PYTHONUNBUFFERED=1

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start production server
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:${PORT} --workers 2 --threads 4 --timeout 120"]
