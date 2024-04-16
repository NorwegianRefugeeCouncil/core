FROM node:20-alpine as builder

WORKDIR /build

COPY package.json .

COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

RUN ./node_modules/.bin/nx run core-api:build

RUN ./node_modules/.bin/nx run core-frontend:build


FROM node:20-alpine as node_modules

WORKDIR /build

COPY package.json .

COPY yarn.lock .

RUN yarn install --frozen-lockfile --production


FROM node:20-alpine

ENV PROCESS_COUNT=max

ENV PORT=3333

WORKDIR /api

RUN yarn global add pm2

COPY package.json .

COPY yarn.lock .

COPY --from=node_modules /build/node_modules ./node_modules

COPY --from=builder /build/dist/apps/core-api .

COPY --from=builder /build/dist/apps/core-frontend ./static

COPY --from=builder /build/dist/libs ./libs

EXPOSE ${PORT}

CMD pm2 start main.js --no-daemon -i ${PROCESS_COUNT}
