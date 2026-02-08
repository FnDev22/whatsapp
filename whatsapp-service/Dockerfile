# Gunakan Node.js LTS sebagai base image
FROM node:20-slim

# Install dependencies yang dibutuhkan untuk Baileys (native modules)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy semua file project (kecuali yang di .dockerignore)
COPY . .

# Create auth folder dengan proper permissions
RUN mkdir -p auth_info_baileys && chmod 755 auth_info_baileys

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# For Railway: port bisa dynamic dari env, default 8000
ENV PORT=${PORT:-8000}
EXPOSE ${PORT:-8000}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Jalankan aplikasi
CMD ["node", "index.js"]
