FROM node:16-alpine

RUN npm install -g nodemon
RUN npm install -g @nrwl/cli

WORKDIR /core-api

COPY package.json yarn.lock nx.json .

RUN npm install

COPY ./apps/core-api .

RUN npm nx run core-api:build

EXPOSE 4000

CMD ["node", "core-api/dist/apps/core-api/main.js"]