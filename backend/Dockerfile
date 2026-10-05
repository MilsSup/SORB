FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --ignore-scripts
COPY backend ./backend
WORKDIR /app/backend
ENV DATABASE_URL=postgresql://sorb:sorb_dev@db:5432/sorb?schema=public
RUN npm run prisma:generate && npm run build
CMD ["sh", "-c", "npm run prisma:deploy && npm start"]
