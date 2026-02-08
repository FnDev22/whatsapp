# Gunakan Node.js LTS sebagai base image
FROM node:20-slim

# Install dependencies yang dibutuhkan untuk Baileys (native modules)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file project (kecuali yang di .dockerignore)
COPY . .

# Hugging Face Spaces menggunakan port 7860
ENV PORT=7860
EXPOSE 7860

# Jalankan aplikasi
CMD ["node", "index.js"]
