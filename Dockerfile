FROM node:20-alpine as builder
 
WORKDIR /build
 
RUN yarn global add nx
 
COPY package.json .

COPY yarn.lock .
 
RUN yarn install --frozen-lockfile
 
COPY . .
 
RUN nx run core-api:build

RUN nx run core-frontend:build




 
FROM node:20-alpine
 
ENV PROCESS_COUNT=max
 
WORKDIR /api
 
RUN yarn global add pm2

COPY package.json .

COPY yarn.lock .

COPY --from=builder /build/dist/apps/core-api .

COPY --from=builder /build/dist/apps/core-frontend ./static
 
RUN yarn install --frozen-lockfile --production
 
ENV PORT=3333

CMD pm2 start main.js --no-daemon -i ${PROCESS_COUNT}
