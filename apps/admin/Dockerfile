FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json turbo.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui/package.json ./packages/ui/
RUN npm install
COPY apps/admin ./apps/admin
COPY packages ./packages
WORKDIR /app/apps/admin
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./.next/static
EXPOSE 3002
CMD ["node", "server.js"]
