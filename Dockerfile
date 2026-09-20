FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV NODE_ENV=production
# NUXT_DATABASE_URL (y opcionalmente NUXT_SEED_ADMIN_PASSWORD) se pasan al
# correr el contenedor, no se hornean en la imagen. Ver README > Despliegue.
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
