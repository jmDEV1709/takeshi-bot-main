# syntax=docker/dockerfile:1.7

FROM node:22-slim

ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    CHROMIUM_PATH=/usr/bin/chromium

# FFmpeg/WebP/ImageMagick, node-canvas and Chromium dependencies.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        chromium \
        ffmpeg \
        fonts-liberation \
        giflib-tools \
        imagemagick \
        libcairo2-dev \
        libfontconfig1 \
        libgbm1 \
        libgif-dev \
        libgtk-3-0 \
        libjpeg-dev \
        libnss3 \
        libpango1.0-dev \
        librsvg2-dev \
        libx11-xcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libxshmfence1 \
        pkg-config \
        python3 \
        yt-dlp \
        webp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first so dependency installation remains cached between builds.
COPY package.json package-lock.json ./
COPY scripts/patch-baileys.mjs ./scripts/patch-baileys.mjs
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev \
    && npm cache clean --force

COPY . .

# Keep runtime writable paths available to the unprivileged user.
RUN mkdir -p assets/auth/baileys assets/temp database \
    && chown -R node:node /app

USER node

CMD ["node", "./src/index.js"]
