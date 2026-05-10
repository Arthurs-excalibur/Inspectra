FROM node:20-slim

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    libnss3 \
    libasound2 \
    libxss1 \
    libxtst6 \
    libxkbcommon0 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libfontconfig1 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install -g @nestjs/cli
RUN npm install

# Build backend
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm install
RUN npm run build

# Install Playwright browsers
RUN npx playwright install chromium --with-deps

EXPOSE 4000

CMD ["npm", "run", "start"]
