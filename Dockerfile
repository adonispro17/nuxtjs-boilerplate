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
ENV NURSE_DB_PATH=/data/nursing.db
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
