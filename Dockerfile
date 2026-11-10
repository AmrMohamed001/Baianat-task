FROM node:24 as base

FROM base as development
WORKDIR /task-app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "run","start:docker"]

FROM base as production
WORKDIR /task-app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD [ "npm", "run","start:prod"]