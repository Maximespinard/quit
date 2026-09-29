# The release image: the built PWA and the server that serves it next to `/api`.
# Built from the repository root (`docker build .`): the repo is npm workspaces with one
# lockfile, which `npm ci` checks against every workspace manifest.

# --- The PWA: `npm run build` into /build/dist. Its typecheck covers what ships, not the tests
# against the real server (`npm run typecheck` does): their server sources are not here.
FROM node:24-alpine AS app

WORKDIR /build
COPY package.json package-lock.json ./
COPY contract/package.json ./contract/
COPY server/package.json ./server/
# The root's dependencies (the app and its build tools) and the contract it imports: never
# the server's. No install scripts: the build needs none.
RUN npm ci --ignore-scripts --include-workspace-root --workspace contract

# Every project tsconfig.json references: Vite's transform resolves them all.
COPY tsconfig.json tsconfig.app.json tsconfig.node.json tsconfig.server-tests.json ./
COPY vite.config.ts index.html ./
COPY public ./public
COPY src ./src
COPY contract/src ./contract/src
RUN npm run build

# --- The server: Node runs its TypeScript sources directly (type stripping), no build stage.
FROM node:24-alpine
LABEL org.opencontainers.image.source=https://github.com/Maximespinard/quit

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY contract/package.json ./contract/
COPY server/package.json ./server/
# No install scripts: better-sqlite3 loads the prebuilt binary it ships (linuxmusl included),
# whereas npm would run node-gyp for it, which needs a toolchain the image does not have.
RUN npm ci --omit=dev --ignore-scripts --workspace server && npm cache clean --force

COPY contract/src ./contract/src
COPY server/src ./server/src
COPY server/drizzle ./server/drizzle
COPY --from=app /build/dist ./dist

# The database lives on a volume owned by the unprivileged user.
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data

# PORT defaults to 8080 (src/config.ts); the issue command reads the same DATA_DIR:
# `docker exec <container> node src/issue-device-key.ts`.
ENV DATA_DIR=/data APP_DIR=/app/dist
EXPOSE 8080
WORKDIR /app/server
CMD ["node", "src/main.ts"]
