FROM node:18-alpine

RUN npm install -g nodemon

WORKDIR /core-app

COPY ../apps/core-app/package.json .

RUN yarn

COPY ../apps/core-app .

RUN nx run core-app:build

EXPOSE 3000

CMD ["yarn", "serve"]