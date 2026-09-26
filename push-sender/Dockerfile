# Node runs the TypeScript sources directly (type stripping): no build stage.
FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# The state file lives on a volume owned by the unprivileged user.
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data

ENV PORT=8080 DATA_FILE=/data/state.json
EXPOSE 8080
CMD ["node", "src/main.ts"]
