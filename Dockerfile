FROM node:20-alpine as builder
 
WORKDIR /build
 
RUN yarn global add nx
 
COPY package.json .
COPY yarn.lock .
 
RUN yarn install --frozen-lockfile
 
COPY . .
 
RUN nx run core-api:build



FROM node:20-alpine
 
WORKDIR /build

RUN yarn global add nx
 
COPY package.json .
COPY yarn.lock .
 
RUN yarn install --frozen-lockfile
 
COPY . .
 
RUN nx run core-frontend:build --verbose

COPY /build/dist/apps/core-frontend /build/dist/apps/core-api/assets 


 
FROM node:20-alpine
 
ENV PROCESS_COUNT=max
 
WORKDIR /api
 
RUN yarn global add pm2
 
COPY --from=builder /build/dist/apps/core-api .
 
RUN yarn install --frozen-lockfile --production
 
CMD pm2 start main.js --no-daemon -i ${PROCESS_COUNT}
