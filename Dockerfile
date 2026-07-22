# ---- Stage 1: Build ----
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"
RUN npx prisma generate
RUN npm run build

# ---- Stage 2: Production ----
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main"]