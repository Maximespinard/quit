# Built from the repository root (`docker build -f push-sender/Dockerfile .`): the repo is npm
# workspaces with one lockfile, which `npm ci` checks against every workspace manifest.
# Node runs the TypeScript sources directly (type stripping): no build stage.
FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY contract/package.json ./contract/
COPY push-sender/package.json ./push-sender/
RUN npm ci --omit=dev --workspace push-sender && npm cache clean --force

COPY push-sender/src ./push-sender/src

# The state file lives on a volume owned by the unprivileged user.
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data

# PORT and DATA_FILE default to 8080 and /data/state.json (src/config.ts).
EXPOSE 8080
WORKDIR /app/push-sender
CMD ["node", "src/main.ts"]
