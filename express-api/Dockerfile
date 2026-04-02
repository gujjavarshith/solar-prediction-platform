FROM node:20-slim

WORKDIR /app

# Prisma needs OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Install deps
COPY package.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy app code
COPY src/ ./src/

EXPOSE 3000

# Push DB schema then start
CMD sh -c "npx prisma db push --skip-generate && node src/index.js"
